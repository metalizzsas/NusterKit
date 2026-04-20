import type { NumericParameterBlockHydrated, StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/parameter-block-hydrated";
import type { AllProgramBlocks, AppendMaintenanceProgramBlock as AppendMaintenanceProgramBlockSpec } from "$types/spec/cycle/program";
import type { PBRContext } from "../../../services/pbr-context";
import { ParameterBlockRegistry } from "../../parameter-blocks/parameter-block-registry";
import { ProgramBlock } from "../program-block";

export class AppendMaintenanceProgramBlock extends ProgramBlock {
	taskName: StringParameterBlockHydrated;
	taskValue: NumericParameterBlockHydrated;

	constructor(obj: AppendMaintenanceProgramBlockSpec, ctx: PBRContext) {
		super(obj, ctx);
		this.taskName = ParameterBlockRegistry.String(obj.append_maintenance[0]);
		this.taskValue = ParameterBlockRegistry.Numeric(obj.append_maintenance[1]);
	}

	public async execute(): Promise<void> {
		this.ctx.maintenance.append(this.taskName.data, this.taskValue.data);
		super.execute();
	}

	static isAppendMaintenancePgB(obj: AllProgramBlocks): obj is AppendMaintenanceProgramBlockSpec {
		return (obj as AppendMaintenanceProgramBlockSpec).append_maintenance !== undefined;
	}
}
