import type { NumericParameterBlockHydrated, StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/parameter-block-hydrated";
import type { AllProgramBlocks, SetVariableProgramBlock as SetVariableProgramBlockSpec } from "$types/spec/cycle/program";
import type { PBRContext } from "../../../services/pbr-context";
import { ParameterBlockRegistry } from "../../parameter-blocks/parameter-block-registry";
import { ProgramBlock } from "../program-block";

export class SetVariableProgramBlock extends ProgramBlock {
	variable_name: StringParameterBlockHydrated;
	variable_value: NumericParameterBlockHydrated;

	constructor(obj: SetVariableProgramBlockSpec, ctx: PBRContext) {
		super(obj, ctx);
		this.variable_name = ParameterBlockRegistry.String(obj.set_var[0]);
		this.variable_value = ParameterBlockRegistry.Numeric(obj.set_var[1]);
	}

	public async execute(): Promise<void> {
		this.ctx.write_variable(this.variable_name.data, this.variable_value.data);
		super.execute();
	}

	static is_set_variable_pg_b(obj: AllProgramBlocks): obj is SetVariableProgramBlockSpec {
		return (obj as SetVariableProgramBlockSpec).set_var !== undefined;
	}
}
