import type { NumericParameterBlockHydrated, StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/parameter-block-hydrated";
import type { AllProgramBlocks, StartTimerProgramBlock as StartTimerProgramBlockSpec } from "$types/spec/cycle/program";
import type { PBRContext } from "../../../services/pbr-context";
import { ParameterBlockRegistry } from "../../parameter-blocks/parameter-block-registry";
import { ProgramBlock } from "../program-block";
import { ProgramBlockRegistry } from "../program-block-registry";

export class StartTimerProgramBlock extends ProgramBlock {
	executed = false;

	timer_name: StringParameterBlockHydrated;
	timer_interval: NumericParameterBlockHydrated;
	blocks: Array<ProgramBlock>;

	constructor(obj: StartTimerProgramBlockSpec, ctx: PBRContext) {
		super(obj, ctx);
		this.timer_name = ParameterBlockRegistry.String(obj.start_timer.timer_name);
		this.timer_interval = ParameterBlockRegistry.Numeric(obj.start_timer.timer_interval);
		this.blocks = obj.start_timer.blocks.map((k) => ProgramBlockRegistry(k, ctx));
	}

	public async execute(): Promise<void> {
		if (this.earlyExit === true) return;

		const timer_name = this.timer_name.data;
		const timer_interval = this.timer_interval.data;

		if (this.ctx.timer_exists(timer_name)) {
			this.ctx.logger.log("info", `StartTimerBlock: Will not start timer with name: ${timer_name} because it already exists.`);
		} else {
			const timer = setInterval(async () => {
				if (!this.paused) {
					for (const b of this.blocks) {
						await b.execute();
					}
				}
			}, timer_interval * 1000);

			this.ctx.logger.log("info", `StartTimerBlock: Will start timer with name: ${timer_name} and interval: ${timer_interval * 1000} ms.`);
			this.ctx.timer_start({ name: timer_name, timer, enabled: true });
		}

		super.execute();
	}

	dispose(): void {
		super.dispose();
		for (const b of this.blocks) b.dispose();
	}

	static is_start_timer_pg_b(obj: AllProgramBlocks): obj is StartTimerProgramBlockSpec {
		return (obj as StartTimerProgramBlockSpec).start_timer !== undefined;
	}
}
