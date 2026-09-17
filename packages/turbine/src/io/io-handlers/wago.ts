import ModbusTCP from "modbus-serial";
import ping from "ping";
import type { IOBase, IOSize, WAGO as WAGOConfig } from "$types/spec/iohandlers";
import { TurbineEventLoop } from "../../events";
import { AsyncMutex } from "../../utils/async-mutex";

const MAX_RECONNECT_DELAY = 30_000; // 30s cap
const BASE_RECONNECT_DELAY = 2_000; // 2s initial
/**
 * Délai de réponse d'une requête Modbus. Sans lui, modbus-serial attend
 * indéfiniment : sur une connexion TCP à demi ouverte — coupure sans FIN,
 * automate qui redémarre — une écriture ne rendait jamais la main, le mutex
 * restait pris, et toutes les E/S du WAGO se figeaient derrière elle. Le
 * keepalive ne voyait rien, `isOpen` restant vrai sur un socket à demi ouvert.
 * Sur machine : un `regulators#power ← 0` de fin d'étape resté pendu cinq
 * minutes, jusqu'au `stepOvertime`.
 */
const MODBUS_TIMEOUT_MS = 2_000;

export class WAGO implements IOBase, WAGOConfig {
	type = "wago" as const;

	connected = false;
	unreachable = false;
	ip: string;

	public client: ModbusTCP;
	private connect_timer?: ReturnType<typeof setInterval>;
	private reconnect_timer?: ReturnType<typeof setTimeout>;
	private reconnect_attempts = 0;
	private connecting = false;
	private io_mutex = new AsyncMutex();

	constructor(ip: string) {
		this.ip = ip;
		this.client = new ModbusTCP();
		this.client.setTimeout(MODBUS_TIMEOUT_MS);
		this.connect();
	}

	/**
	 * Une requête qui expire veut dire que la connexion ne répond plus, même si
	 * le socket se croit ouvert. On le ferme pour que le keepalive le voie et
	 * relance la reconnexion, plutôt que d'enchaîner les expirations.
	 */
	private drop_connection(reason: unknown): void {
		TurbineEventLoop.emit("log", "error", `WAGO: Request failed, dropping the connection: ${(reason as Error)?.message ?? reason}`);
		this.connected = false;
		try {
			this.client.close(() => {});
		} catch {
			// best-effort close
		}
	}

	async connect(): Promise<boolean> {
		// Prevent overlapping connect attempts
		if (this.connecting) return false;

		this.connecting = true;

		try {
			const available = await new Promise<boolean>((resolve) => {
				ping.sys.probe(this.ip, (is_alive) => resolve(is_alive ?? false));
			});

			if (!available) {
				// A failed ping is a transient condition — a brief network drop, a switch
				// renegotiating, the controller rebooting — not a verdict. Latching on it
				// used to disable this handler for the lifetime of the process: readData
				// then returned 0 for every gate, so every IO-based run condition went red
				// on a machine whose sensors were fine, and only a restart recovered it.
				if (!this.unreachable) TurbineEventLoop.emit("log", "error", `WAGO: Failed to ping ${this.ip}, retrying.`);
				this.unreachable = true;
				this.schedule_reconnect();
				return false;
			}

			await this.client.connectTCP(this.ip, { port: 502 }).catch((error) => TurbineEventLoop.emit("log", "error", `WAGO: ${error}`));

			this.connected = this.client.isOpen;

			if (this.connected) {
				TurbineEventLoop.emit("log", "info", "WAGO: Connected");
				this.unreachable = false;
				this.reconnect_attempts = 0;
				this.clear_reconnect_timer();
				this.start_keep_alive();
				return true;
			}

			return false;
		} finally {
			this.connecting = false;
		}
	}

	private start_keep_alive(): void {
		if (this.connect_timer) clearInterval(this.connect_timer);

		this.connect_timer = setInterval(() => {
			this.connected = this.client.isOpen;
			if (!this.connected) {
				TurbineEventLoop.emit("log", "info", "WAGO: Disconnected, scheduling reconnect");
				this.clear_keep_alive();
				this.schedule_reconnect();
			}
		}, 2000);
	}

	private schedule_reconnect(): void {
		// connect() schedules on failure and the timer below retries, so guard against
		// two chains of attempts running side by side.
		if (this.reconnect_timer) return;

		this.reconnect_attempts++;
		const delay = Math.min(BASE_RECONNECT_DELAY * 2 ** (this.reconnect_attempts - 1), MAX_RECONNECT_DELAY);
		TurbineEventLoop.emit("log", "info", `WAGO: Reconnect attempt #${this.reconnect_attempts} in ${delay}ms`);

		this.reconnect_timer = setTimeout(async () => {
			this.reconnect_timer = undefined;
			const success = await this.connect();
			if (!success) {
				this.schedule_reconnect();
			}
		}, delay);
	}

	private clear_reconnect_timer(): void {
		if (this.reconnect_timer) {
			clearTimeout(this.reconnect_timer);
			this.reconnect_timer = undefined;
		}
	}

	private clear_keep_alive(): void {
		if (this.connect_timer) {
			clearInterval(this.connect_timer);
			this.connect_timer = undefined;
		}
	}

	async writeData(address: number, data: number, size: IOSize = "bit"): Promise<void> {
		if (size === "dword") throw new Error("WAGO: 32-bit (dword) writes are not supported");

		if (this.unreachable) {
			TurbineEventLoop.emit(`pbr.stop`, "controllerUnreachable");
			return;
		}

		await this.io_mutex.acquire();
		try {
			if (!this.client.isOpen) {
				const connected = await this.connect();

				if (!connected) return;
			}

			try {
				if (size === "word") {
					await this.client.writeRegister(address, data);
				} else {
					await this.client.writeCoil(address, data == 1);
				}
			} catch (err) {
				this.drop_connection(err);
				throw err;
			}
		} finally {
			this.io_mutex.release();
		}
	}

	async readData(address: number, size: IOSize = "bit"): Promise<number> {
		if (size === "dword") throw new Error("WAGO: 32-bit (dword) reads are not supported");

		if (this.unreachable) {
			TurbineEventLoop.emit(`pbr.stop`, "controllerUnreachable");
			return 0;
		}

		await this.io_mutex.acquire();
		try {
			if (!this.client.isOpen) {
				const connected = await this.connect();

				if (!connected) return 0;
			}

			try {
				if (size === "word") {
					const result = await this.client.readHoldingRegisters(address, 1);
					return result.data[0];
				}

				const result = await this.client.readCoils(address, 1);
				return result.data[0] ? 1 : 0;
			} catch (err) {
				// On ne fabrique pas de lecture : la gate garde sa dernière valeur et
				// journalise l'échec, le keepalive rétablit la connexion.
				this.drop_connection(err);
				throw err;
			}
		} finally {
			this.io_mutex.release();
		}
	}

	dispose(): void {
		this.clear_keep_alive();
		this.clear_reconnect_timer();
		try {
			this.client.close(() => {});
		} catch {
			// best-effort close
		}
	}

	toJSON() {
		return {
			type: this.type,
			ip: this.ip,
		};
	}
}
