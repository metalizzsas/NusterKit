import type { StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/parameter-block-hydrated";
import type { AllProgramBlocks, StopTimerProgramBlock as StopTimerProgramBlockSpec } from "$types/spec/cycle/program";
import type { PBRContext } from "../../../services/pbr-context";
import { ParameterBlockRegistry } from "../../parameter-blocks/parameter-block-registry";
import { ProgramBlock } from "../program-block";

export class StopTimerProgramBlock extends ProgramBlock {
	timer_name: StringParameterBlockHydrated;

	constructor(obj: StopTimerProgramBlockSpec, ctx: PBRContext) {
		super(obj, ctx);
		this.timer_name = ParameterBlockRegistry.String(obj.stop_timer);
	}

	public async execute(): Promise<void> {
		const timer_name = this.timer_name.data;

		this.ctx.logger.log("info", `StopTimerBlock: Will stop timer with name: ${timer_name}`);
		const stopped = this.ctx.timer_stop(timer_name);
		if (!stopped) {
			this.ctx.logger.log("warning", `StopTimerBlock: Timer ${timer_name} has not been found, ignoring.`);
		}

		super.execute();
	}

	static is_stop_timer_pg_b(obj: AllProgramBlocks): obj is StopTimerProgramBlockSpec {
		return (obj as StopTimerProgramBlockSpec).stop_timer !== undefined;
	}
}
