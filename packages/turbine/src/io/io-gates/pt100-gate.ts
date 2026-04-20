import type { PT100Gate as PT100GateConfig } from "$types/spec/iogates/";
import type { IOBase } from "$types/spec/iohandlers";
import { TurbineEventLoop } from "../../events";
import { IOGate } from "./io-gate";

export class PT100Gate extends IOGate implements PT100GateConfig {
	type = "pt100" as const;
	unity = "°C" as const;
	size = "word" as const;
	bus = "in" as const;

	public async read() {
		const temp = await this.controller_instance.readData(this.address, true);
		this.value = temp / 10;
		TurbineEventLoop.emit(`io.updated.${this.name}`, this.toJSON());
		return true;
	}

	public async write() {
		TurbineEventLoop.emit("log", "warning", `PT100Gate-${this.name}: Cannot write to read-only gate.`);
		return true;
	}
}
