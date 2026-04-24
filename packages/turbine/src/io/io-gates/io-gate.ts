import type { IOGateJSON } from "$types/hydrated/io";
import type { IOGateBase, IOGates } from "$types/spec/iogates";
import type { IOBase, IOSize } from "$types/spec/iohandlers";
import { TurbineEventLoop } from "../../events";

export class IOGate implements IOGateBase {
	name: string;
	category: string;

	locked = false;
	private _on_update: (options: { value: number; lock?: boolean; callback?: () => void | Promise<void> }) => Promise<void>;

	size: IOSize;
	bus: "out" | "in";
	type: IOGates["type"];

	controllerId: number;
	controller_instance: IOBase;
	address: number;
	default: number;
	unity?: string | undefined;

	/** Gate value read or written to controller */
	value: number;

	constructor(obj: IOGates, controller_instance: IOBase) {
		this.name = obj.name;
		this.category = obj.name.split("#").length > 1 ? obj.name.split("#")[0] : "generic";
		this.unity = obj.unity;

		this.size = obj.size;
		this.type = obj.type;
		this.bus = obj.bus;

		this.controllerId = obj.controllerId;
		this.controller_instance = controller_instance;
		this.address = obj.address;

		this.default = obj.default;

		// Initialize the gate with its default value
		this.value = obj.default;

		this._on_update = async (options) => {
			if (options.lock !== undefined) {
				if (this.locked != options.lock)
					TurbineEventLoop.emit("log", "warning", "IOG-" + this.name + ": Lock state has been updated to " + options.lock);

				this.locked = options.lock;
			}

			await this.write(options.value);
			await options.callback?.();
		};

		TurbineEventLoop.on(`io.update.${this.name}`, this._on_update);
	}

	dispose(): void {
		TurbineEventLoop.removeListener(`io.update.${this.name}`, this._on_update);
	}

	async read(): Promise<boolean> {
		if (this.bus == "out") return true;

		try {
			const controller_data = await this.read_from_controller(this.size);
			this.value = controller_data;
			TurbineEventLoop.emit(`io.updated.${this.name}`, this.toJSON());
		} catch (err) {
			TurbineEventLoop.emit("log", "error", `IOG-${this.name}: Read failed: ${(err as Error).message}`);
			return false;
		}

		return true;
	}

	async write(data: number): Promise<boolean> {
		if (this.bus == "in") return true;

		TurbineEventLoop.emit("log", "info", "IOG-" + this.name + ": Writing (" + data + ") to fieldbus.");

		try {
			await this.writeto_controller(data, this.size);
		} catch (err) {
			TurbineEventLoop.emit("log", "error", `IOG-${this.name}: Write failed: ${(err as Error).message}`);
			return false;
		}
		this.value = data;

		TurbineEventLoop.emit(`io.updated.${this.name}`, this.toJSON());
		TurbineEventLoop.emit("ws.dirty", "io");

		return true;
	}

	async read_from_controller(size?: IOSize): Promise<number> {
		return await this.controller_instance.readData(this.address, size);
	}

	async writeto_controller(data: number, size?: IOSize): Promise<boolean> {
		await this.controller_instance.writeData(this.address, data, size);
		return true;
	}

	toJSON(): IOGateJSON {
		return {
			name: this.name,
			type: this.type,
			locked: this.locked,
			category: this.category,
			value: this.value,
			unity: this.unity,
			bus: this.bus,
			size: this.size,
		};
	}
}
