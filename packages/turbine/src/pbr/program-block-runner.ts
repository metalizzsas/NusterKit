import type { PBRMode, PBRStatus, PBRTimer, PBRVariable } from "$types/hydrated/cycle/program-block-runner-hydrated";
import type { ProfileHydrated } from "$types/hydrated/profiles";
import type { PBRStepResult } from "$types/spec/cycle/pbr-step";
import type { ProgramBlockRunner as ProgramBlockRunnerConfig } from "$types/spec/cycle/program-block-runner";
import { TurbineEventLoop } from "../events";
import type { ServiceRegistry } from "../services/interfaces";
import type { PBRContext } from "../services/pbr-context";
import { PBRContextImpl } from "../services/pbr-context-impl";
import { PBRRunCondition } from "./pbr-security-condition";
import { ProgramBlockStep } from "./program-block-step";

/**
 * Program Block Runner
 * @desc Transforms JSON Blocks into machine instructions.
 */
export class ProgramBlockRunner {
	pausable: boolean;

	status: PBRStatus = { mode: "creating", pausable: false };

	name: string;
	profileRequired: boolean;

	variables: Array<PBRVariable> = [];
	timers: (PBRTimer & { timer?: ReturnType<typeof setInterval> })[] = [];

	/** **PBR** Steps */
	steps: Array<ProgramBlockStep> = [];

	/** Start conditions of the **PBR** */
	runConditions: Array<PBRRunCondition> = [];

	/** Index of the current step being runt */
	currentStepIndex = 0;

	/** Profile assignated to this **PBR** */
	profile?: ProfileHydrated;

	additionalInfo?: Array<string>;

	/** Estimated duration */
	duration: number;

	events: Array<{ data: string; time: number }> = [];

	/** Stored listener references for targeted removal in dispose_events() */
	private _on_pause!: () => void | Promise<void>;
	private _on_resume!: () => Promise<void>;
	private _on_set_pausable!: (pausable: boolean) => void;
	private _on_stop!: (reason: string) => void;

	/** PBR Context for dependency injection into blocks */
	ctx?: PBRContext;

	/** Pause utils */
	io_pause_snapshot: Record<string, number> = {};

	total_paused_time = 0;
	pause_start_date?: number;

	/** Periodic broadcast tick — keeps the UI's step progress in sync. */
	private broadcast_interval?: ReturnType<typeof setInterval>;

	constructor(object: ProgramBlockRunnerConfig, profile?: ProfileHydrated, service_registry?: ServiceRegistry) {
		TurbineEventLoop.emit("log", "info", "PBR: Building PBR...");

		this.name = object.name;
		this.profileRequired = object.profileRequired;
		this.profile = profile;
		this.additionalInfo = object.additionalInfo;

		this.pausable = object.pausable ?? false;

		if (this.profile === undefined) TurbineEventLoop.emit("log", "info", "PBR: This PBR is build without any profile.");

		this.register_events();

		// Create PBRContext with all state wired up
		if (service_registry) {
			this.ctx = new PBRContextImpl({
				services: service_registry,
				variables: this.variables,
				timers: this.timers,
				profile: this.profile,
				set_pausable: (pausable) => {
					if (this.pausable === false) return;
					this.status.pausable = pausable;
				},
				stop: (reason) => this.end(reason),
			});
		}

		for (const sc of object.runConditions)
			this.runConditions.push(
				new PBRRunCondition(
					sc,
					(data) => {
						TurbineEventLoop.emit(`pbr.stop`, `security-${data.name}`);
					},
					this.ctx!,
				),
			);

		for (const step of object.steps) this.steps.push(new ProgramBlockStep(this, step, this.ctx!));

		this.set_state("created");
		TurbineEventLoop.emit("log", "info", "PBR: Finished building PBR.");

		this.duration = this.steps.filter((s) => s.isEnabled.data == 1).reduce((p, c) => (p += c.duration), 0);

		this.add_event(`PBR Created, estimated duration ${this.duration}s`);
	}

	/** Register events of this `PBR` */
	private register_events() {
		this._on_pause = async () => {
			if (this.pausable === false) {
				TurbineEventLoop.emit("log", "warning", "PBR: Tried to pause a cycle that is not pausable.");
				return;
			}
			if (this.status.mode === "paused") {
				TurbineEventLoop.emit("log", "warning", "PBR: Tried to pause a cycle that is already paused.");
				return;
			}
			if (this.status.mode !== "started") {
				TurbineEventLoop.emit("log", "warning", "PBR: Tried to pause a cycle that is not started.");
				return;
			}

			this.pause_start_date = Date.now();
			this.set_state("paused");

			this.io_pause_snapshot = structuredClone(this.ctx!.io.snapshot());
			await this.ctx!.io.reset_all();
			this.ctx!.logger.log("warning", "PBR: Paused cycle.");
		};
		TurbineEventLoop.on("pbr.pause", this._on_pause);

		this._on_resume = async () => {
			if (this.pausable === false) {
				TurbineEventLoop.emit("log", "warning", "PBR: Tried to resume a cycle that is not pausable.");
				return;
			}
			if (this.status.mode === "started") {
				TurbineEventLoop.emit("log", "warning", "PBR: Tried to resume a cycle that is already started.");
				return;
			}
			if (this.status.mode !== "paused") {
				TurbineEventLoop.emit("log", "warning", "PBR: Tried to resume a cycle that is not paused.");
				return;
			}

			this.set_state("started");

			for (const io in this.io_pause_snapshot) {
				try {
					await this.ctx!.io.write(io, this.io_pause_snapshot[io]);
				} catch (err) {
					this.ctx!.logger.log("error", `PBR: Resume IO restore failed for ${io}: ${(err as Error).message}`);
				}
			}

			this.total_paused_time += (Date.now() - (this.pause_start_date ?? 0)) / 1000;
			this.pause_start_date = undefined;
			this.ctx!.logger.log("warning", "PBR: Resumed cycle.");
		};
		TurbineEventLoop.on("pbr.resume", this._on_resume);

		this._on_set_pausable = (pausable: boolean) => {
			if (this.pausable === false) return;
			this.status.pausable = pausable;
		};
		TurbineEventLoop.on("pbr.set_pausable", this._on_set_pausable);

		this._on_stop = (reason) => this.end(reason);
		TurbineEventLoop.on("pbr.stop", this._on_stop);
	}

	/** Removes this PBR instance's event listeners */
	private dispose_events() {
		TurbineEventLoop.removeListener("pbr.stop", this._on_stop);
		TurbineEventLoop.removeListener("pbr.pause", this._on_pause);
		TurbineEventLoop.removeListener("pbr.resume", this._on_resume);
		TurbineEventLoop.removeListener("pbr.set_pausable", this._on_set_pausable);
	}

	/**
	 * Runs the cycle
	 * @async
	 * @returns A boolean stating if the cycle is successful or not
	 */
	public async run(): Promise<boolean> {
		TurbineEventLoop.emit("log", "info", "PBRSC: Checking Start conditions.");

		const invalid_start_conditions_count = this.allRunConditions.filter((sc) => sc.canStart == false).length;

		if (invalid_start_conditions_count > 0) {
			TurbineEventLoop.emit("log", "error", "PBRSC: Start conditions are not valid.");
			return false;
		}

		TurbineEventLoop.emit("log", "info", "PBRSC: Start conditions are valid.");
		TurbineEventLoop.emit("log", "info", "PBRSC: Removing start conditions only used at start.");

		this.runConditions.forEach((sc) => {
			if (sc.startOnly === true) {
				sc.dispose();
				TurbineEventLoop.emit("log", "info", ` ↳ Removed ${sc.name}`);
			}
		});

		TurbineEventLoop.emit("log", "info", `PBR: Started cycle ${this.name}.`);

		this.add_event(`PBR Started`);

		this.set_state("started");
		this.status.startDate = Date.now();

		while (this.currentStepIndex < this.steps.length) {
			let result: PBRStepResult | null = null;

			if (!["ended", "ending"].includes(this.status.mode)) result = await this.steps[this.currentStepIndex].execute();
			else break;

			if (result === "next") {
				TurbineEventLoop.emit("log", "info", "PBR: Step ended, going to next step.");
				this.currentStepIndex++;
			} else {
				TurbineEventLoop.emit("log", "info", `PBR: Ended step asked to go to step: ${this.steps[result].name}.`);

				if (this.currentStepIndex < result) {
					// The starting loop index is set to currentStepIndex + 1 because the current step has already ended, it prevents PBR to set the step state to "skipped" when it's not.
					for (let i = this.currentStepIndex + 1; i < result; i++) this.steps[i].endReason = "skipped";
				}

				this.currentStepIndex = result;
			}
		}

		this.dispose();
		return true;
	}

	/**
	 * Next step could end the current step to go along the rest of the cycle.
	 * @alpha
	 * @testing
	 */
	public next_step() {
		TurbineEventLoop.emit("log", "warning", `PBR: Next step triggered.`);
		this.currentRunningStep.end("skipped");
	}

	/** Add Events to the PBR history */
	public add_event(event: string) {
		this.events.push({ data: event, time: Date.now() });
	}

	/**
	 * Set the PBR State
	 * @param state State to set
	 */
	private set_state(state: PBRMode) {
		this.status.mode = state;
		TurbineEventLoop.emit("pbr.status.update", state);
		TurbineEventLoop.emit("ws.dirty", "cycle");

		if (state === "started" && this.broadcast_interval === undefined) {
			this.broadcast_interval = setInterval(() => TurbineEventLoop.emit("ws.dirty", "cycle"), 500);
		} else if (state === "ended" && this.broadcast_interval !== undefined) {
			clearInterval(this.broadcast_interval);
			this.broadcast_interval = undefined;
		}
	}

	/**
	 * Ends the cycle
	 * @param reason End reason
	 */
	public end(reason: string) {
		if (this.status.mode !== "started") {
			TurbineEventLoop.emit("log", "warning", "PBR: Cannot end a cycle that has not started.");
			return;
		}

		/** Avoid ending cycle with a ghost startonly run condition */
		const possible_rc_ending = this.runConditions.find((rc) => rc.name === reason);
		if (possible_rc_ending !== undefined && possible_rc_ending.startOnly === true) {
			TurbineEventLoop.emit("log", "warning", "PBR: Cannot end a cycle with a start only run condition.");
			return;
		}

		this.set_state("ending");
		this.status.endReason = reason;

		this.steps.forEach((s) => s.crash("ending"));

		if (reason !== undefined) TurbineEventLoop.emit("log", "warning", "PBR: Triggered cycle end with reason: " + reason);

		this.add_event(`Cycle ended with reason ${reason}.`);
	}

	/** Dispose the cycle before its deletion */
	public dispose() {
		if (this.status.endReason === undefined) this.status.endReason = "finished";

		TurbineEventLoop.emit("log", "info", "PBR: Disposing cycle.");
		if (this.currentStepIndex < this.steps.length) {
			TurbineEventLoop.emit("log", "error", `PBR: Program ended before all steps were executed.`);

			//Removing 1 to runCount because the step was stopped before its end
			const s = this.steps.at(this.currentStepIndex);
			if (s !== undefined) {
				if (s.type == "multiple" && s.runCount !== undefined) {
					TurbineEventLoop.emit("log", "error", `PBR: Last executed step was a multiple step. Removing 1 multiple step iteration.`);
					s.runCount--;
				}
			}
		}

		//Removing Start conditions timers
		if (this.runConditions.length > 0) {
			TurbineEventLoop.emit("log", "info", "PBR: Removing Start Conditions checks.");
			for (const sc of this.runConditions) sc.dispose();
		}

		//Clearing timer blocks
		if (this.timers.length > 0) {
			TurbineEventLoop.emit("log", "info", "PBR: Clearing timers.");
			for (const timer of this.timers) {
				TurbineEventLoop.emit("log", "info", " ↳ Clearing timer: " + timer.name);
				clearInterval(timer.timer);
			}
		}

		// Dispose steps (removes listeners from all blocks, steps, and step run conditions)
		TurbineEventLoop.emit("log", "info", "PBR: Disposing steps and blocks.");
		for (const step of this.steps) {
			step.dispose();
		}

		this.dispose_events();

		if (this.broadcast_interval !== undefined) {
			clearInterval(this.broadcast_interval);
			this.broadcast_interval = undefined;
		}

		//Append 1 to cycle count
		this.ctx!.maintenance.append("cycleCount", 1);

		this.set_state("ended");
		this.status.endDate = Date.now();

		this.ctx!.logger.log("info", "PBR: Resetting all io gates to default values.");
		this.ctx!.io.reset_all();

		TurbineEventLoop.emit("log", "info", `PBR: Ended cycle ${this.name} with state: ${this.status.mode} & reason: ${this.status.endReason}.`);

		this.add_event(`Cycle disposed.`);
	}

	/** Compute progress of the cycle */
	public get progress() {
		return Date.now() / (this.status.startDate ?? 1) / (this.duration + this.overallPausedTime);
	}

	/** Return current running step reference */
	public get currentRunningStep(): ProgramBlockStep {
		return this.steps[this.currentStepIndex];
	}

	get allRunConditions(): Array<PBRRunCondition> {
		return [...this.runConditions, ...this.steps.flatMap((s) => s.runConditions).filter((s): s is PBRRunCondition => s !== undefined)];
	}

	get overallPausedTime(): number {
		const current_pause_time = this.pause_start_date !== undefined ? Date.now() - this.pause_start_date : 0;

		return this.total_paused_time + current_pause_time / 1000;
	}

	toJSON() {
		return {
			status: { ...this.status, progress: this.progress, estimatedRunTime: this.duration, overallPausedTime: this.overallPausedTime },

			//identifiers vars
			name: this.name,
			profileRequired: this.profileRequired,

			//Inside definers
			steps: this.steps.map((s) => s.toJSON()),
			runConditions: this.allRunConditions.map((k) => k.toJSON()).filter((rc, i, a) => a.findIndex((rc2) => rc2.name === rc.name) === i),

			//internals
			currentStepIndex: this.currentStepIndex,
			variables: this.variables,
			timers: this.timers.map((t) => ({ name: t.name, enabled: t.enabled })),

			//statics
			profile: this.profile,

			//additional informations
			additionalInfo: this.additionalInfo,

			events: this.events,
		};
	}
}
