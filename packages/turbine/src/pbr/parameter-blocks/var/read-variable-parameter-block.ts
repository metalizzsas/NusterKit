import type { StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/parameter-block-hydrated";
import type { AllParameterBlocks, ReadVariableParameterBlock as ReadVariableParameterBlockSpec } from "$types/spec/cycle/parameter";
import type { PBRContext } from "../../../services/pbr-context";
import { NumericParameterBlock } from "../numeric-parameter-block";
import { ParameterBlockRegistry } from "../parameter-block-registry";

export class ReadVariableParameterBlock extends NumericParameterBlock {
	private variable_name: StringParameterBlockHydrated;
	private ctx: PBRContext;

	#variable_value = 0;

	constructor(obj: ReadVariableParameterBlockSpec, ctx: PBRContext) {
		super(obj);
		this.ctx = ctx;
		this.variable_name = ParameterBlockRegistry.String(obj.read_var);

		this.#variable_value = this.ctx.read_variable(this.variable_name.data);
		this.ctx.pbr_emitter.on("variable.write", ({ name, value }) => {
			if (name === this.variable_name.data) this.#variable_value = value;
		});
	}

	public get data(): number {
		return this.#variable_value;
	}

	static is_read_variable_pb(obj: AllParameterBlocks): obj is ReadVariableParameterBlockSpec {
		return (obj as ReadVariableParameterBlockSpec).read_var !== undefined;
	}
}
