import ModbusTCP from "modbus-serial";
import ping from "ping";
import type { IOBase, WAGO as WAGOConfig } from "$types/spec/iohandlers";
import { TurbineEventLoop } from "../../events";
import { AsyncMutex } from "../../utils/async-mutex";

const MAX_RECONNECT_DELAY = 30_000; // 30s cap
const BASE_RECONNECT_DELAY = 2_000; // 2s initial

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
		this.connect();
	}

	async connect(): Promise<boolean> {
		// Prevent overlapping connect attempts
		if (this.connecting) return false;
		if (this.unreachable) return false;

		this.connecting = true;

		try {
			const available = await new Promise<boolean>((resolve) => {
				ping.sys.probe(this.ip, (is_alive) => resolve(is_alive ?? false));
			});

			if (!available) {
				this.unreachable = true;
				TurbineEventLoop.emit("log", "error", `WAGO: Failed to ping, cancelling connection.`);
				return false;
			}

			await this.client.connectTCP(this.ip, { port: 502 }).catch((error) => TurbineEventLoop.emit("log", "error", `WAGO: ${error}`));

			this.connected = this.client.isOpen;

			if (this.connected) {
				TurbineEventLoop.emit("log", "info", "WAGO: Connected");
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
		this.reconnect_attempts++;
		const delay = Math.min(BASE_RECONNECT_DELAY * 2 ** (this.reconnect_attempts - 1), MAX_RECONNECT_DELAY);
		TurbineEventLoop.emit("log", "info", `WAGO: Reconnect attempt #${this.reconnect_attempts} in ${delay}ms`);

		this.reconnect_timer = setTimeout(async () => {
			this.reconnect_timer = undefined;
			const success = await this.connect();
			if (!success && !this.unreachable) {
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

	async writeData(address: number, data: number, word?: boolean): Promise<void> {
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

			if (word && word == true) {
				await this.client.writeRegister(address, data);
			} else {
				await this.client.writeCoil(address, data == 1);
			}
		} finally {
			this.io_mutex.release();
		}
	}

	async readData(address: number, word?: boolean): Promise<number> {
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

			let result = null;

			if (word && word == true) {
				result = await this.client.readHoldingRegisters(address, 1);
				return result.data[0];
			} else {
				result = await this.client.readCoils(address, 1);
				return result.data[0] ? 1 : 0;
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
