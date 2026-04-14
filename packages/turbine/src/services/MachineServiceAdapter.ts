import type { MachineService } from "./interfaces";
import type { MachineSpecs } from "$types/index";

/**
 * MachineService adapter — provides direct access to machine specs and variables.
 */
export class MachineServiceAdapter implements MachineService {
	private specs: MachineSpecs;
	private variables: Array<{ name: string; value: number }>;

	constructor(specs: MachineSpecs, variables: Array<{ name: string; value: number }>) {
		this.specs = specs;
		this.variables = variables;
	}

	readVariable(name: string): number {
		return this.variables.find(v => v.name === name)?.value ?? 0;
	}

	getConfig(): MachineSpecs {
		return this.specs;
	}
}
