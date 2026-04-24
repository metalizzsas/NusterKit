import { Buffer } from "buffer";
import { promises as fs } from "fs";
import type { FileHandle } from "fs/promises";
import type { IOBase, IOSize, RevolutionPi as RevolutionPiConfig } from "$types/spec/iohandlers";
import { TurbineEventLoop } from "../../events";
import { AsyncMutex } from "../../utils/async-mutex";

const DEFAULT_DEVICE_PATH = "/dev/piControl0";
const MAX_RECONNECT_DELAY = 30_000;
const BASE_RECONNECT_DELAY = 2_000;

/**
 * RevolutionPi IO handler — reads/writes the piControl process image directly.
 *
 * Address convention on IOGate:
 *  - size "bit"   → address = byte_offset * 8 + bit_index
 *  - size "word"  → address = byte offset, int16 little-endian
 *  - size "dword" → address = byte offset, int32 little-endian
 *
 * Byte/bit offsets per module slot come from PiCtory (transcribe into specs.json).
 */
export class RevolutionPi implements IOBase, RevolutionPiConfig {
	type = "revolutionpi" as const;

	connected = false;
	unreachable = false;

	devicePath: string;

	private fd?: FileHandle;
	private io_mutex = new AsyncMutex();
	private reconnect_timer?: ReturnType<typeof setTimeout>;
	private reconnect_attempts = 0;
	private connecting = false;

	constructor(device_path?: string) {
		this.devicePath = process.env.REVPI_DEVICE_PATH ?? device_path ?? DEFAULT_DEVICE_PATH;
		this.connect();
	}

	async connect(): Promise<boolean> {
		if (this.connecting) return false;
		if (this.connected) return true;

		this.connecting = true;

		try {
			this.fd = await fs.open(this.devicePath, "r+");
			this.connected = true;
			this.unreachable = false;
			this.reconnect_attempts = 0;
			this.clear_reconnect_timer();
			TurbineEventLoop.emit("log", "info", `RevolutionPi: Connected to ${this.devicePath}`);
			return true;
		} catch (err) {
			const code = (err as NodeJS.ErrnoException).code;
			this.connected = false;

			if (code === "ENOENT" || code === "EACCES" || code === "EPERM") {
				if (!this.unreachable) {
					TurbineEventLoop.emit("log", "error", `RevolutionPi: ${this.devicePath} unreachable (${code}). Will retry.`);
				}
				this.unreachable = true;
			} else {
				TurbineEventLoop.emit("log", "error", `RevolutionPi: connect failed: ${(err as Error).message}`);
			}

			this.schedule_reconnect();
			return false;
		} finally {
			this.connecting = false;
		}
	}

	private schedule_reconnect(): void {
		if (this.reconnect_timer) return;

		this.reconnect_attempts++;
		const delay = Math.min(BASE_RECONNECT_DELAY * 2 ** (this.reconnect_attempts - 1), MAX_RECONNECT_DELAY);

		this.reconnect_timer = setTimeout(async () => {
			this.reconnect_timer = undefined;
			this.unreachable = false;
			const success = await this.connect();
			if (!success) this.schedule_reconnect();
		}, delay);
	}

	private clear_reconnect_timer(): void {
		if (this.reconnect_timer) {
			clearTimeout(this.reconnect_timer);
			this.reconnect_timer = undefined;
		}
	}

	private async ensure_connected(): Promise<boolean> {
		if (this.connected && this.fd) return true;
		return await this.connect();
	}

	async readData(address: number, size: IOSize = "bit"): Promise<number> {
		if (!(await this.ensure_connected()) || !this.fd) {
			TurbineEventLoop.emit(`pbr.stop`, "controllerUnreachable");
			return 0;
		}

		await this.io_mutex.acquire();
		try {
			if (size === "bit") {
				const byte_offset = address >> 3;
				const bit_index = address & 7;
				const buf = Buffer.alloc(1);
				await this.fd.read(buf, 0, 1, byte_offset);
				return (buf[0] >> bit_index) & 1;
			}

			if (size === "word") {
				const buf = Buffer.alloc(2);
				await this.fd.read(buf, 0, 2, address);
				return buf.readInt16LE(0);
			}

			// dword
			const buf = Buffer.alloc(4);
			await this.fd.read(buf, 0, 4, address);
			return buf.readInt32LE(0);
		} catch (err) {
			this.handle_io_error(err);
			return 0;
		} finally {
			this.io_mutex.release();
		}
	}

	async writeData(address: number, data: number, size: IOSize = "bit"): Promise<void> {
		if (!(await this.ensure_connected()) || !this.fd) {
			TurbineEventLoop.emit(`pbr.stop`, "controllerUnreachable");
			return;
		}

		await this.io_mutex.acquire();
		try {
			if (size === "bit") {
				const byte_offset = address >> 3;
				const bit_index = address & 7;
				const buf = Buffer.alloc(1);
				await this.fd.read(buf, 0, 1, byte_offset);
				const mask = 1 << bit_index;
				buf[0] = data ? buf[0] | mask : buf[0] & ~mask;
				await this.fd.write(buf, 0, 1, byte_offset);
				return;
			}

			if (size === "word") {
				// Write the low 16 bits directly so callers may pass either
				// signed int16 (AIO) or unsigned uint16 without range errors.
				const buf = Buffer.alloc(2);
				buf[0] = data & 0xff;
				buf[1] = (data >> 8) & 0xff;
				await this.fd.write(buf, 0, 2, address);
				return;
			}

			// dword — same treatment for the low 32 bits
			const buf = Buffer.alloc(4);
			buf[0] = data & 0xff;
			buf[1] = (data >> 8) & 0xff;
			buf[2] = (data >> 16) & 0xff;
			buf[3] = (data >>> 24) & 0xff;
			await this.fd.write(buf, 0, 4, address);
		} catch (err) {
			this.handle_io_error(err);
		} finally {
			this.io_mutex.release();
		}
	}

	private handle_io_error(err: unknown): void {
		const code = (err as NodeJS.ErrnoException).code;
		TurbineEventLoop.emit("log", "error", `RevolutionPi: IO error (${code ?? "unknown"}): ${(err as Error).message}`);

		if (code === "EBADF" || code === "ENODEV" || code === "EIO") {
			this.connected = false;
			try {
				this.fd?.close();
			} catch {
				// best-effort
			}
			this.fd = undefined;
			this.schedule_reconnect();
		}
	}

	async dispose(): Promise<void> {
		this.clear_reconnect_timer();
		try {
			await this.fd?.close();
		} catch {
			// best-effort
		}
		this.fd = undefined;
		this.connected = false;
	}

	toJSON() {
		return {
			type: this.type,
			devicePath: this.devicePath,
		};
	}
}
