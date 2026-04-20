import type { StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/parameter-block-hydrated";
import type { AllProgramBlocks, StopProgramBlock as StopProgramBlockSpec } from "$types/spec/cycle/program";
import type { PBRContext } from "../../../services/pbr-context";
import { ParameterBlockRegistry } from "../../parameter-blocks/parameter-block-registry";
import { ProgramBlock } from "../program-block";

export class StopProgramBlock extends ProgramBlock {
	stop_reason: StringParameterBlockHydrated;

	constructor(obj: StopProgramBlockSpec, ctx: PBRContext) {
		super(obj, ctx);
		this.stop_reason = ParameterBlockRegistry.String(obj.stop);
	}

	public async execute(): Promise<void> {
		if (process.env.NODE_ENV != "production") {
			this.ctx.logger.log("warning", "StopBlock: Debug mode will not stop the machine.");
			return;
		}

		this.ctx.stop(this.stop_reason.data);
		super.execute();
	}

	static is_stop_pg_b(obj: AllProgramBlocks): obj is StopProgramBlockSpec {
		return (obj as StopProgramBlockSpec).stop !== undefined;
	}
}
