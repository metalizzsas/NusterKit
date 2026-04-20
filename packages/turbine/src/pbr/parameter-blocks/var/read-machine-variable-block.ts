import type { StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/parameter-block-hydrated";
import type { AllParameterBlocks, ReadMachineVariableParameterBlock as ReadMachineVariableParameterBlockConfig } from "$types/spec/cycle/parameter";
import type { PBRContext } from "../../../services/pbr-context";
import { ParameterBlockRegistry } from "../parameter-block-registry";
import { NumericParameterBlock } from "../numeric-parameter-block";

export class ReadMachineVariableParameterBlock extends NumericParameterBlock {
	private machineVariableName: StringParameterBlockHydrated;
	private ctx: PBRContext;

	#variableValue = 0;

	constructor(obj: ReadMachineVariableParameterBlockConfig, ctx: PBRContext) {
		super(obj);
		this.ctx = ctx;
		this.machineVariableName = ParameterBlockRegistry.String(obj.read_machine_var);
		this.#variableValue = this.ctx.machine.readVariable(this.machineVariableName.data);
	}

	public get data(): number {
		return this.#variableValue;
	}

	static isReadMachineVariablePB(obj: AllParameterBlocks): obj is ReadMachineVariableParameterBlockConfig {
		return (obj as ReadMachineVariableParameterBlockConfig).read_machine_var !== undefined;
	}
}
