import type { MappedGate as MappedGateConfig } from "$types/spec/iogates";
import type { IOBase } from "$types/spec/iohandlers";
import { TurbineEventLoop } from "../../events";
import { map } from "../../utils/map";
import { IOGate } from "./io-gate";

export class MappedGate extends IOGate implements MappedGate {
	type = "mapped" as const;
	size = "word" as const;

	mapInMin: number;
	mapInMax: number;

	mapOutMin: number;
	mapOutMax: number;

	constructor(obj: MappedGateConfig, controller_instance: IOBase) {
		super(obj, controller_instance);

		this.mapInMin = obj.mapInMin ?? 0;
		this.mapInMax = obj.mapInMax ?? 32767;

		this.mapOutMin = obj.mapOutMin;
		this.mapOutMax = obj.mapOutMax;
	}

	public async read() {
		const v = await super.read_from_controller(true);
		const new_val = Math.floor(map(v, this.mapInMin, this.mapInMax, this.mapOutMin, this.mapOutMax) * 100) / 100;
		this.value = new_val < 0 ? 0 : new_val;

		TurbineEventLoop.emit(`io.updated.${this.name}`, this.toJSON());

		return true;
	}

	public async write(data: number) {
		this.value = data;

		//resolve value to be written of the fieldbus
		let v = Math.floor(map(data, this.mapOutMin, this.mapOutMax, this.mapInMin, this.mapInMax));
		v = v < 0 ? 0 : v;

		TurbineEventLoop.emit(`io.updated.${this.name}`, this.toJSON());
		TurbineEventLoop.emit("ws.dirty", "io");
		TurbineEventLoop.emit("log", "info", "IOMG-" + this.name + ": Writing (" + data + ") to fieldbus.");

		return super.writeto_controller(v, true);
	}

	toJSON() {
		return {
			name: this.name,
			type: this.type,
			locked: this.locked,
			category: this.category,
			value: this.value,
			unity: this.unity,
			bus: this.bus,
			size: this.size,

			mapOutMin: this.mapOutMin,
			mapOutMax: this.mapOutMax,
		};
	}
}
