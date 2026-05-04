import type { NumericParameterBlockHydrated } from "$types/hydrated/cycle/blocks/parameter-block-hydrated";
import type { AllProgramBlocks, SleepProgramBlock as SleepProgramBlockSpec } from "$types/spec/cycle/program";
import type { PBRContext } from "../../../services/pbr-context";
import { ParameterBlockRegistry } from "../../parameter-blocks/parameter-block-registry";
import { ProgramBlock } from "../program-block";

export class SleepProgramBlock extends ProgramBlock {
	sleep_time: NumericParameterBlockHydrated;

	private sleep_resolve?: () => void;
	private sleep_timer?: ReturnType<typeof setTimeout>;
	private timer_start_time?: number;
	private remaining = 0;

	constructor(obj: SleepProgramBlockSpec, ctx: PBRContext) {
		super(obj, ctx);
		this.sleep_time = ParameterBlockRegistry.Numeric(obj.sleep, ctx);
		this.estimatedRunTime = this.sleep_time.data;
	}

	dispose(): void {
		super.dispose();
		if (this.sleep_timer) clearTimeout(this.sleep_timer);
	}

	async execute(signal?: AbortSignal): Promise<void> {
		const sleep_time = this.sleep_time.data * 1000;
		this.remaining = sleep_time;

		this.ctx.logger.log("info", `SleepBlock: Will sleep for ${sleep_time} ms.`);
		this.ctx.set_pausable(true);

		const on_abort = () => this.sleep_resolve?.();
		signal?.addEventListener("abort", on_abort, { once: true });

		const on_pause = () => {
			if (this.sleep_timer) {
				clearTimeout(this.sleep_timer);
				this.sleep_timer = undefined;
			}
			if (this.timer_start_time) {
				this.remaining = Math.max(0, this.remaining - (Date.now() - this.timer_start_time));
				this.timer_start_time = undefined;
			}
		};

		const on_resume = () => {
			this.timer_start_time = Date.now();
			this.sleep_timer = setTimeout(() => this.sleep_resolve?.(), this.remaining);
		};

		this.ctx.pbr_emitter.on("pause", on_pause);
		this.ctx.pbr_emitter.on("resume", on_resume);

		try {
			if (!this.earlyExit && !signal?.aborted) {
				await new Promise<void>((resolve) => {
					this.sleep_resolve = resolve;
					this.timer_start_time = Date.now();
					this.sleep_timer = setTimeout(resolve, this.remaining);
				});
			}
		} finally {
			signal?.removeEventListener("abort", on_abort);
			this.ctx.pbr_emitter.off("pause", on_pause);
			this.ctx.pbr_emitter.off("resume", on_resume);
			if (this.sleep_timer) clearTimeout(this.sleep_timer);
			this.sleep_resolve = undefined;
			this.ctx.set_pausable(false);
		}

		this.executed = true;
	}

	static is_sleep_pg_b(obj: AllProgramBlocks): obj is SleepProgramBlockSpec {
		return (obj as SleepProgramBlockSpec).sleep !== undefined;
	}
}
