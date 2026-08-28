import { Buffer } from "buffer";
import { ENIPClient } from "enip-ts";
import { MessageRouter } from "enip-ts/CIP/MessageRouter";
import type { dataItem } from "enip-ts/Encapsulation/CPF";
import ping from "ping";
import type { EX260Sx as EX260SxConfig, IOBase, IOSize } from "$types/spec/iohandlers";
import { TurbineEventLoop } from "../../events";
import { AsyncMutex } from "../../utils/async-mutex";
import { callback_with_timeout } from "../../utils/callback-with-timeout";

export class EX260Sx implements IOBase, EX260SxConfig {
	type = "ex260sx" as const;

	connected = false;
	unreachable = false;
	ip: string;

	size: 16 | 32;

	private controller: ENIPClient;
	private write_mutex = new AsyncMutex();
	/**
	 * Builds an EX260Sx object
	 * @param ip Ip address of the controller
	 */
	constructor(ip: string, size: 16 | 32) {
		this.ip = ip;
		this.size = size;

		this.controller = new ENIPClient(120000);

		//change state if disconnected
		this.controller.events.on("close", () => {
			TurbineEventLoop.emit("log", "info", "EX260Sx: Disconnected");
			this.connected = false;

			this.controller.close();
		});

		this.connect();
	}

	async connect(): Promise<boolean> {
		if (this.connected) return true;

		const available = await new Promise<boolean>((resolve) => {
			ping.sys.probe(this.ip, (is_alive) => {
				resolve(is_alive || false);
			});
		});

		if (available) {
			const session_id = await this.controller.connect(this.ip);

			if (session_id !== undefined) {
				TurbineEventLoop.emit("log", "info", "EX260Sx: Connected");
				this.unreachable = false;
				this.connected = true;
				return true;
			} else {
				TurbineEventLoop.emit("log", "error", "EX260Sx: Failed to connect");
				TurbineEventLoop.emit(`pbr.stop`, "controllerError");
				this.connected = false;
				return false;
			}
		} else {
			// Same defect as the WAGO handler: latching on one failed ping disabled this
			// controller for the lifetime of the process, and read_data2 then threw on
			// every call, so IO-based run conditions stayed red until a restart. A ping
			// failure is transient — record it, keep answering, and let the next attempt
			// clear it.
			if (!this.unreachable) TurbineEventLoop.emit("log", "error", `EX260Sx: Failed to ping ${this.ip}, retrying.`);
			this.unreachable = true;
			return false;
		}
	}

	/**
	 * Unused read data function
	 * @unused
	 * @param _address
	 * @param _size
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	readData(_address: number, _size?: IOSize): Promise<number> {
		throw new Error("Method not implemented.");
	}

	//Shall only be used for local applications
	async read_data2(address: number): Promise<Buffer> {
		// Reconnect first, then decide: guarding before the attempt meant nothing could
		// ever clear `unreachable`, since every read threw before reaching connect().
		await this.connect();

		if (this.unreachable) throw new Error("EX260Sx: Unreachable");

		//Path for ethernet ip protocol
		const id_path = Buffer.from([0x20, 0x04, 0x24, address, 0x30, 0x03]);

		//Message router packet
		const MR = MessageRouter.build(0x0e, id_path, Buffer.alloc(0));

		//write data to the controller
		const write = await this.controller.write(MR, false, 10);

		if (!write) {
			TurbineEventLoop.emit("log", "error", "EX260Sx: Failed to write data");
			TurbineEventLoop.emit(`pbr.stop`, "controllerError");
			return Buffer.alloc(0);
		}

		return callback_with_timeout<Buffer>(
			(resolve) => {
				this.controller.events.once("SendRRData Received", (result: dataItem[]) => {
					for (const packet of result) {
						if (packet.TypeID == 178 && packet.data.length == 4 + this.size / 8 && packet.data.readUIntLE(0, 1) == 0x8e) {
							resolve(packet.data);
						}
					}
				});
			},
			5000,
			"EX260Sx.read_data2",
		);
	}

	async writeData(address: number, value: number, size: IOSize = "bit"): Promise<void> {
		if (size === "dword") throw new Error("EX260Sx: 32-bit (dword) writes are not supported");

		await this.write_mutex.acquire();
		try {
			await this.connect();

			if (this.unreachable) throw new Error("EX260Sx: Unreachable");

			//patch to prevent writing too early
			await new Promise((resolve) => {
				setTimeout(resolve, 50);
			});

			//Path for ethernet ip protocol
			const id_path = Buffer.from([0x20, 0x04, 0x24, 0x96, 0x30, 0x03]);

			const res = await this.read_data2(0x96);

			if (res.length === 0) throw new Error("EX260Sx: Empty Data returned");

			//Data to read deprends on size of the EX260
			const result = res.readUIntLE(4, this.size / 8);

			//Str binary array result depends on size of the EX260
			const str_binary_array =
				this.size == 32 ? ("00000000000000000000000000000000" + result.toString(2)).slice(-32) : ("0000000000000000" + result.toString(2)).slice(-16);

			//spliting string
			const binary_array = str_binary_array.split("");

			const int_array: number[] = [];

			//replcing String to Int
			binary_array.forEach((part, index, array) => {
				array[index] = part;
				int_array[index] = parseInt(part);
			});

			//Setting the written data
			for (let i = 0; i < binary_array.length; i++) {
				//if the address is the same as the one we want to write
				if (i == address) binary_array[i] = value ? "1" : "0";
			}

			//converting array of bit to long bit
			const new_outputs_states = binary_array.join("");

			//convert bin array to int
			const new_decimal_output_state = parseInt(new_outputs_states, 2);

			const buf = Buffer.alloc(this.size / 8);

			if (this.size == 32) buf.writeUInt32LE(new_decimal_output_state);
			else buf.writeUInt16LE(new_decimal_output_state);

			//Message router packet
			const MR = MessageRouter.build(0x10, id_path, buf);

			//write data to the controller
			const write = await this.controller.write(MR, false, 10);

			if (write === false) {
				TurbineEventLoop.emit("log", "warning", "EX260Sx: Failed to write data");
				TurbineEventLoop.emit(`pbr.stop`, "controllerError");
			}
		} finally {
			this.write_mutex.release();
		}
	}

	dispose(): void {
		try {
			this.controller.close();
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
