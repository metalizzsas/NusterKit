import type { NumericParameterBlockHydrated } from "$types/hydrated/cycle/blocks/parameter-block-hydrated";
import type { AllProgramBlocks, SleepProgramBlock as SleepProgramBlockSpec } from "$types/spec/cycle/program";
import type { PBRContext } from "../../../services/pbr-context";
import { ParameterBlockRegistry } from "../../parameter-blocks/parameter-block-registry";
import { ProgramBlock } from "../program-block";

export class SleepProgramBlock extends ProgramBlock {
	sleepTime: NumericParameterBlockHydrated;

	private sleepResolve?: () => void;
	private sleepTimer?: ReturnType<typeof setTimeout>;
	private timerStartTime?: number;
	private remaining = 0;

	constructor(obj: SleepProgramBlockSpec, ctx: PBRContext) {
		super(obj, ctx);
		this.sleepTime = ParameterBlockRegistry.Numeric(obj.sleep);
		this.estimatedRunTime = this.sleepTime.data;
	}

	dispose(): void {
		super.dispose();
		if (this.sleepTimer) clearTimeout(this.sleepTimer);
	}

	async execute(signal?: AbortSignal): Promise<void> {
		const sleepTime = this.sleepTime.data * 1000;
		this.remaining = sleepTime;

		this.ctx.logger.log("info", `SleepBlock: Will sleep for ${sleepTime} ms.`);
		this.ctx.setPausable(true);

		const onAbort = () => this.sleepResolve?.();
		signal?.addEventListener("abort", onAbort, { once: true });

		const onPause = () => {
			if (this.sleepTimer) {
				clearTimeout(this.sleepTimer);
				this.sleepTimer = undefined;
			}
			if (this.timerStartTime) {
				this.remaining = Math.max(0, this.remaining - (Date.now() - this.timerStartTime));
				this.timerStartTime = undefined;
			}
		};

		const onResume = () => {
			this.timerStartTime = Date.now();
			this.sleepTimer = setTimeout(() => this.sleepResolve?.(), this.remaining);
		};

		this.ctx.pbrEmitter.on("pause", onPause);
		this.ctx.pbrEmitter.on("resume", onResume);

		try {
			if (!this.earlyExit && !signal?.aborted) {
				await new Promise<void>((resolve) => {
					this.sleepResolve = resolve;
					this.timerStartTime = Date.now();
					this.sleepTimer = setTimeout(resolve, this.remaining);
				});
			}
		} finally {
			signal?.removeEventListener("abort", onAbort);
			this.ctx.pbrEmitter.off("pause", onPause);
			this.ctx.pbrEmitter.off("resume", onResume);
			if (this.sleepTimer) clearTimeout(this.sleepTimer);
			this.sleepResolve = undefined;
			this.ctx.setPausable(false);
		}

		this.executed = true;
	}

	static isSleepPgB(obj: AllProgramBlocks): obj is SleepProgramBlockSpec {
		return (obj as SleepProgramBlockSpec).sleep !== undefined;
	}
}
