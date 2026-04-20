import type { NumericParameterBlockHydrated, StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/parameter-block-hydrated";
import type { AllProgramBlocks, AppendMaintenanceProgramBlock as AppendMaintenanceProgramBlockSpec } from "$types/spec/cycle/program";
import type { PBRContext } from "../../../services/pbr-context";
import { ParameterBlockRegistry } from "../../parameter-blocks/parameter-block-registry";
import { ProgramBlock } from "../program-block";

export class AppendMaintenanceProgramBlock extends ProgramBlock {
	task_name: StringParameterBlockHydrated;
	task_value: NumericParameterBlockHydrated;

	constructor(obj: AppendMaintenanceProgramBlockSpec, ctx: PBRContext) {
		super(obj, ctx);
		this.task_name = ParameterBlockRegistry.String(obj.append_maintenance[0]);
		this.task_value = ParameterBlockRegistry.Numeric(obj.append_maintenance[1]);
	}

	public async execute(): Promise<void> {
		this.ctx.maintenance.append(this.task_name.data, this.task_value.data);
		super.execute();
	}

	static is_append_maintenance_pg_b(obj: AllProgramBlocks): obj is AppendMaintenanceProgramBlockSpec {
		return (obj as AppendMaintenanceProgramBlockSpec).append_maintenance !== undefined;
	}
}
