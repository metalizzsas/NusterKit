import type { PBRStepHydrated } from "$types/hydrated/cycle";
import { TurbineEventLoop } from "../events";
import type { PBRContext } from "../services/pbr-context";
import type { NumericParameterBlockHydrated } from "../types/hydrated/cycle/blocks/parameter-block-hydrated";
import type { ProgramBlockHydrated } from "../types/hydrated/cycle/blocks/program-block-hydrated";
import type { PBRStep, PBRStepResult, PBRStepState, PBRStepType } from "../types/spec/cycle/pbr-step";
import { ParameterBlockRegistry } from "./parameter-blocks/parameter-block-registry";
import { PBRRunCondition } from "./pbr-security-condition";
import type { ProgramBlockRunner } from "./program-block-runner";
import { ProgramBlockRegistry } from "./program-blocks/program-block-registry";

export class ProgramBlockStep {
	private pbr_instance: ProgramBlockRunner;

	name: string;

	/** Current step state, Setting this flag to `ENDING` should end the step faster */
	state: PBRStepState = "created";
	type: PBRStepType = "single";

	endReason?: string;

	isEnabled: NumericParameterBlockHydrated;

	startTime?: number;
	endTime?: number;

	runCount = 0;
	runAmount?: NumericParameterBlockHydrated;

	partialStepFallback?: number;
	crashStepFallback?: number;

	blocks: Array<ProgramBlockHydrated> = [];
	startBlocks: Array<ProgramBlockHydrated> = [];
	endBlocks: Array<ProgramBlockHydrated> = [];

	runConditions: Array<PBRRunCondition> = [];

	step_overtime_timer?: NodeJS.Timeout;
	private overtime_remaining_ms?: number;
	private overtime_started_at?: number;

	duration: number;

	step_runcontroller: AbortController = new AbortController();

	total_pause_time = 0;
	current_pause_start_date?: number;

	progresses: Array<number | null>;

	private _on_step_stop: (reason?: string) => void;
	private _on_pause: () => void;
	private _on_resume: () => void;

	constructor(pbr_instance: ProgramBlockRunner, obj: PBRStep, ctx: PBRContext) {
		this.pbr_instance = pbr_instance;
		this.name = obj.name;
		this.isEnabled = ParameterBlockRegistry.Numeric(obj.isEnabled, ctx);

		this.partialStepFallback = obj.partialStepFallback;
		this.crashStepFallback = obj.crashStepFallback;

		if (obj.runAmount) {
			this.runAmount = ParameterBlockRegistry.Numeric(obj.runAmount);
			this.type = (this.runAmount?.data ?? 0) > 1 ? "multiple" : "single";
		}

		this.progresses = new Array(this.runAmount?.data ?? 1).fill(0);

		// Build blocks
		obj.startBlocks.forEach((b) => this.startBlocks.push(ProgramBlockRegistry(b, ctx)));
		obj.endBlocks.forEach((b) => this.endBlocks.push(ProgramBlockRegistry(b, ctx)));
		obj.blocks.forEach((b) => this.blocks.push(ProgramBlockRegistry(b, ctx)));

		// Build run conditions
		obj.runConditions?.forEach((rc) =>
			this.runConditions.push(
				new PBRRunCondition(
					rc,
					(data) => {
						this.crash(`security-${data.name}`);
					},
					ctx,
				),
			),
		);

		this.duration = this.estimate_run_time();

		/** Listen for step end events */
		this._on_step_stop = (reason?: string) => {
			if (this.state == "started") {
				TurbineEventLoop.emit("log", "warning", `PBS-${this.name}: Step has been stopped by the user. Reason: ${reason ?? "No reason given."}`);
				this.state = "ending";
				this.step_runcontroller.abort();
			}
		};
		TurbineEventLoop.addListener(`pbr.step.${this.name}.stop`, this._on_step_stop);

		this._on_pause = () => {
			if (this.state === "started") {
				this.current_pause_start_date = Date.now();

				// Cancel overtime timer and record how much time was left
				if (this.step_overtime_timer && this.overtime_started_at !== undefined && this.overtime_remaining_ms !== undefined) {
					const elapsed = Date.now() - this.overtime_started_at;
					this.overtime_remaining_ms = Math.max(0, this.overtime_remaining_ms - elapsed);
					this.cancel_overtime_timer();
				}
			}
		};
		TurbineEventLoop.on("pbr.pause", this._on_pause);

		this._on_resume = () => {
			if (this.state === "started") {
				this.total_pause_time += (Date.now() - (this.current_pause_start_date ?? 0)) / 1000;
				this.current_pause_start_date = undefined;

				// Restart overtime timer with remaining time
				this.start_overtime_timer();
			}
		};
		TurbineEventLoop.on("pbr.resume", this._on_resume);
	}

	public async execute(): Promise<PBRStepResult> {
		// End step if disabled
		if (this.isEnabled.data == 0) {
			TurbineEventLoop.emit("log", "warning", `PBS-${this.name}: Step is disabled.`);
			return "next";
		}

		if (this.pbr_instance.status.mode == "ended") {
			TurbineEventLoop.emit("log", "warning", `PBS-${this.name}: Tried to execute step while cycle ended.`);
			return "next";
		}

		// Reset abort controller if step is multiple and runCount > 0
		if (this.type === "multiple" && this.runCount > 0) {
			this.step_runcontroller = new AbortController();
			this.endReason = undefined;
		}

		TurbineEventLoop.emit("log", "info", `PBS-${this.name}: Started step.`);
		this.pbr_instance.add_event(`PBS: Started ${this.name} step.`);
		this.state = "started";

		// Reset overtime tracking for fresh start (or new iteration of multiple step)
		this.overtime_remaining_ms = undefined;
		this.overtime_started_at = undefined;
		this.start_overtime_timer();

		this.startTime = Date.now();

		TurbineEventLoop.emit("log", "info", `PBS-${this.name}: Executing io starter blocks.`);

		for (const io of this.startBlocks) {
			await io.execute();
		}

		TurbineEventLoop.emit("log", "info", `PBS-${this.name}: Executing step main blocks.`);
		for (const b of this.blocks) {
			await b.execute(this.step_runcontroller.signal);
		}

		TurbineEventLoop.emit("log", "info", `${this.name}: Executing io ending blocks.`);
		for (const io of this.endBlocks) {
			await io.execute();
		}

		this.cancel_overtime_timer();

		this.runCount++;

		// Handle step end

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		if (this.state === "crashed") {
			this.state = "crashed";
			TurbineEventLoop.emit("log", "info", `PBS-${this.name}: Ended step with state ${this.state}`);
			this.endTime = Date.now();

			this.progresses[this.runCount - 1] = this.progress;

			return this.crashStepFallback ?? "next";
		}

		this.endTime = Date.now();

		if (this.type === "multiple") {
			if (this.runCount >= (this.runAmount?.data ?? 1)) {
				this.state = "ended";
				TurbineEventLoop.emit("log", "info", `PBS-${this.name}: Ended step with state ${this.state}`);

				this.progresses[this.runCount - 1] = 1;

				return "next";
			} else {
				this.state = "partial";
				TurbineEventLoop.emit("log", "info", `PBS-${this.name}: Ended step partialy with state ${this.state}`);

				this.progresses[this.runCount - 1] = 1;

				return this.partialStepFallback ?? "next";
			}
		} else {
			this.state = "ended";
			TurbineEventLoop.emit("log", "info", `PBS-${this.name}: Ended step with state ${this.state}`);

			this.progresses[this.runCount - 1] = 1;

			return "next";
		}
	}

	/**
	 * Crash the step, use the abortController to stop running blocks.
	 */
	public crash(reason?: string) {
		if (this.state !== "started") return;

		this.endReason = reason;
		TurbineEventLoop.emit("log", "info", `PBS: Crashing ${this.name} with reason: ${this.endReason}.`);
		this.step_runcontroller.abort();
		this.state = "crashed";

		this.pbr_instance.add_event(`PBS: Step crashed ${this.name}, reason: ${this.endReason ?? "no reason given"}.`);
	}

	public end(reason?: string) {
		if (this.state !== "started") return;

		this.endReason = reason;
		TurbineEventLoop.emit("log", "info", `PBS: Ending ${this.name} with reason: ${this.endReason}.`);
		this.step_runcontroller.abort();
		this.state = "ended";

		this.pbr_instance.add_event(`PBS: Step ${this.name} ended, reason: ${this.endReason ?? "No reason given"}.`);
	}

	/** Estimate the run time of this step */
	private estimate_run_time(): number {
		return [...this.endBlocks, ...this.startBlocks, ...this.blocks].reduce((p, c) => p + c.estimatedRunTime, 0);
	}

	/**
	 * This returns the step progress, if the step can be runt multiple times, returns the current iteration progress.
	 * @returns The progress of the step, if null, the current step progress cannot be computed.
	 */
	get progress() {
		let progress = 0;

		if (this.duration === Infinity) {
			this.progresses[this.runCount] = null;
			return null;
		}

		if (this.state === "started") {
			progress = ((Date.now() - (this.startTime ?? 1)) / 1000 - this.overallPausedTime) / this.duration;
			this.progresses[this.runCount] = structuredClone(progress >= 1 ? 1 : progress);
		}

		return progress >= 1 ? 1 : progress;

		/*  else if(["ended", "partial", "crashed"].includes(this.state))
        {
            if(this.endReason === "skipped" || this.endReason?.includes("security"))
                progress = (((this.endTime ?? 1) - (this.startTime ?? 1)) / 1000) / this.duration;
            else
                progress = 1;
        } */
	}

	public reset_times() {
		this.startTime = undefined;
		this.endTime = undefined;
	}

	private start_overtime_timer(): void {
		if (this.duration === Infinity) return;

		const remaining = this.overtime_remaining_ms ?? this.duration * 2000;
		this.overtime_remaining_ms = remaining;
		this.overtime_started_at = Date.now();

		this.step_overtime_timer = setTimeout(() => {
			if (this.state === "started") {
				TurbineEventLoop.emit("log", "error", `PBS-${this.name}: Step has been too long. Triggering stepOvertime.`);
				this.pbr_instance.end("stepOvertime");
			} else {
				TurbineEventLoop.emit("log", "warning", `PBS-${this.name}: Step overtime has been canceled because step was not running.`);
			}
		}, remaining);
	}

	private cancel_overtime_timer(): void {
		if (this.step_overtime_timer) {
			clearTimeout(this.step_overtime_timer);
			this.step_overtime_timer = undefined;
		}
	}

	/** Remove event listeners and dispose all child blocks and run conditions */
	public dispose(): void {
		this.cancel_overtime_timer();
		TurbineEventLoop.removeListener(`pbr.step.${this.name}.stop`, this._on_step_stop);
		TurbineEventLoop.removeListener("pbr.pause", this._on_pause);
		TurbineEventLoop.removeListener("pbr.resume", this._on_resume);

		for (const b of [...this.startBlocks, ...this.blocks, ...this.endBlocks]) {
			b.dispose();
		}

		for (const rc of this.runConditions) {
			rc.dispose();
		}
	}

	get overallPausedTime(): number {
		const current_pause_time = this.current_pause_start_date !== undefined ? Date.now() - this.current_pause_start_date : 0;
		return this.total_pause_time + current_pause_time / 1000;
	}

	toJSON(): PBRStepHydrated {
		return {
			name: this.name,
			state: this.state,
			type: this.type,

			isEnabled: this.isEnabled.data === 1,
			runAmount: this.runAmount?.data ?? 1,
			runCount: this.runCount,

			duration: this.duration + this.overallPausedTime,
			progress: this.progress,
			progresses: this.progresses,

			endReason: this.endReason,
		};
	}
}
