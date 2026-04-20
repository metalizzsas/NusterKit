import type { StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/parameter-block-hydrated";
import type { AllParameterBlocks, ReadMachineVariableParameterBlock as ReadMachineVariableParameterBlockConfig } from "$types/spec/cycle/parameter";
import type { PBRContext } from "../../../services/pbr-context";
import { NumericParameterBlock } from "../numeric-parameter-block";
import { ParameterBlockRegistry } from "../parameter-block-registry";

export class ReadMachineVariableParameterBlock extends NumericParameterBlock {
	private machine_variable_name: StringParameterBlockHydrated;
	private ctx: PBRContext;

	#variable_value = 0;

	constructor(obj: ReadMachineVariableParameterBlockConfig, ctx: PBRContext) {
		super(obj);
		this.ctx = ctx;
		this.machine_variable_name = ParameterBlockRegistry.String(obj.read_machine_var);
		this.#variable_value = this.ctx.machine.read_variable(this.machine_variable_name.data);
	}

	public get data(): number {
		return this.#variable_value;
	}

	static is_read_machine_variable_pb(obj: AllParameterBlocks): obj is ReadMachineVariableParameterBlockConfig {
		return (obj as ReadMachineVariableParameterBlockConfig).read_machine_var !== undefined;
	}
}
