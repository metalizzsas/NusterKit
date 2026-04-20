import type { StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllParameterBlocks, ReadVariableParameterBlock as ReadVariableParameterBlockSpec } from "$types/spec/cycle/parameter";
import type { PBRContext } from "../../../services/PBRContext";
import { ParameterBlockRegistry } from "../ParameterBlockRegistry";
import { NumericParameterBlock } from "../NumericParameterBlock";

export class ReadVariableParameterBlock extends NumericParameterBlock {
	private variableName: StringParameterBlockHydrated;
	private ctx: PBRContext;

	#variableValue = 0;

	constructor(obj: ReadVariableParameterBlockSpec, ctx: PBRContext) {
		super(obj);
		this.ctx = ctx;
		this.variableName = ParameterBlockRegistry.String(obj.read_var);

		this.#variableValue = this.ctx.readVariable(this.variableName.data);
		this.ctx.pbrEmitter.on("variable.write", ({ name, value }) => {
			if (name === this.variableName.data)
				this.#variableValue = value;
		});
	}

	public get data(): number {
		return this.#variableValue;
	}

	static isReadVariablePB(obj: AllParameterBlocks): obj is ReadVariableParameterBlockSpec {
		return (obj as ReadVariableParameterBlockSpec).read_var !== undefined;
	}
}
