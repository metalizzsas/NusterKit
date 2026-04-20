import type { NumericParameterBlockHydrated, StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllProgramBlocks, StartTimerProgramBlock as StartTimerProgramBlockSpec } from "$types/spec/cycle/program";
import type { PBRContext } from "../../../services/PBRContext";
import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";
import { ProgramBlockRegistry } from "../ProgramBlockRegistry";
import { ProgramBlock } from "../ProgramBlock";

export class StartTimerProgramBlock extends ProgramBlock {
	executed = false;

	timerName: StringParameterBlockHydrated;
	timerInterval: NumericParameterBlockHydrated;
	blocks: Array<ProgramBlock>;

	constructor(obj: StartTimerProgramBlockSpec, ctx: PBRContext) {
		super(obj, ctx);
		this.timerName = ParameterBlockRegistry.String(obj.start_timer.timer_name);
		this.timerInterval = ParameterBlockRegistry.Numeric(obj.start_timer.timer_interval);
		this.blocks = obj.start_timer.blocks.map(k => ProgramBlockRegistry(k, ctx));
	}

	public async execute(): Promise<void> {
		if (this.earlyExit === true) return;

		const timerName = this.timerName.data;
		const timerInterval = this.timerInterval.data;

		if (this.ctx.timerExists(timerName)) {
			this.ctx.logger.log("info", `StartTimerBlock: Will not start timer with name: ${timerName} because it already exists.`);
		} else {
			const timer = setInterval(async () => {
				if (!this.paused) {
					for (const b of this.blocks) {
						await b.execute();
					}
				}
			}, timerInterval * 1000);

			this.ctx.logger.log("info", `StartTimerBlock: Will start timer with name: ${timerName} and interval: ${timerInterval * 1000} ms.`);
			this.ctx.timerStart({ name: timerName, timer, enabled: true });
		}

		super.execute();
	}

	dispose(): void {
		super.dispose();
		for (const b of this.blocks) b.dispose();
	}

	static isStartTimerPgB(obj: AllProgramBlocks): obj is StartTimerProgramBlockSpec {
		return (obj as StartTimerProgramBlockSpec).start_timer !== undefined;
	}
}
