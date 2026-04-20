import type { PBRMode, PBRStatus, PBRTimer, PBRVariable } from "$types/hydrated/cycle/ProgramBlockRunnerHydrated";
import type { ProfileHydrated } from "$types/hydrated/profiles";
import type { PBRStepResult } from "$types/spec/cycle/PBRStep";
import type { ProgramBlockRunner as ProgramBlockRunnerConfig } from "$types/spec/cycle/ProgramBlockRunner";
import { TurbineEventLoop } from "../events";
import type { ServiceRegistry } from "../services/interfaces";
import type { PBRContext } from "../services/PBRContext";
import { PBRContextImpl } from "../services/PBRContextImpl";
import { PBRRunCondition } from "./PBRSecurityCondition";
import { ProgramBlockStep } from "./ProgramBlockStep";

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

	/** Stored listener references for targeted removal in disposeEvents() */
	private _onPause!: () => void | Promise<void>;
	private _onResume!: () => Promise<void>;
	private _onSetPausable!: (pausable: boolean) => void;
	private _onStop!: (reason: string) => void;

	/** PBR Context for dependency injection into blocks */
	ctx?: PBRContext;

	/** Pause utils */
	ioPauseSnapshot: Record<string, number> = {};

	totalPausedTime = 0;
	pauseStartDate?: number;

	constructor(object: ProgramBlockRunnerConfig, profile?: ProfileHydrated, serviceRegistry?: ServiceRegistry) {
		TurbineEventLoop.emit("log", "info", "PBR: Building PBR...");

		this.name = object.name;
		this.profileRequired = object.profileRequired;
		this.profile = profile;
		this.additionalInfo = object.additionalInfo;

		this.pausable = object.pausable ?? false;

		if (this.profile === undefined) TurbineEventLoop.emit("log", "info", "PBR: This PBR is build without any profile.");

		this.registerEvents();

		// Create PBRContext with all state wired up
		if (serviceRegistry) {
			this.ctx = new PBRContextImpl({
				services: serviceRegistry,
				variables: this.variables,
				timers: this.timers,
				profile: this.profile,
				setPausable: (pausable) => {
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

		this.setState("created");
		TurbineEventLoop.emit("log", "info", "PBR: Finished building PBR.");

		this.duration = this.steps.filter((s) => s.isEnabled.data == 1).reduce((p, c) => (p += c.duration), 0);

		this.addEvent(`PBR Created, estimated duration ${this.duration}s`);
	}

	/** Register events of this `PBR` */
	private registerEvents() {
		this._onPause = async () => {
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

			this.pauseStartDate = Date.now();
			this.setState("paused");

			this.ioPauseSnapshot = structuredClone(this.ctx!.io.snapshot());
			await this.ctx!.io.resetAll();
			this.ctx!.logger.log("warning", "PBR: Paused cycle.");
		};
		TurbineEventLoop.on("pbr.pause", this._onPause);

		this._onResume = async () => {
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

			this.setState("started");

			for (const io in this.ioPauseSnapshot) {
				try {
					await this.ctx!.io.write(io, this.ioPauseSnapshot[io]);
				} catch (err) {
					this.ctx!.logger.log("error", `PBR: Resume IO restore failed for ${io}: ${(err as Error).message}`);
				}
			}

			this.totalPausedTime += (Date.now() - (this.pauseStartDate ?? 0)) / 1000;
			this.pauseStartDate = undefined;
			this.ctx!.logger.log("warning", "PBR: Resumed cycle.");
		};
		TurbineEventLoop.on("pbr.resume", this._onResume);

		this._onSetPausable = (pausable: boolean) => {
			if (this.pausable === false) return;
			this.status.pausable = pausable;
		};
		TurbineEventLoop.on("pbr.setPausable", this._onSetPausable);

		this._onStop = (reason) => this.end(reason);
		TurbineEventLoop.on("pbr.stop", this._onStop);
	}

	/** Removes this PBR instance's event listeners */
	private disposeEvents() {
		TurbineEventLoop.removeListener("pbr.stop", this._onStop);
		TurbineEventLoop.removeListener("pbr.pause", this._onPause);
		TurbineEventLoop.removeListener("pbr.resume", this._onResume);
		TurbineEventLoop.removeListener("pbr.setPausable", this._onSetPausable);
	}

	/**
	 * Runs the cycle
	 * @async
	 * @returns A boolean stating if the cycle is successful or not
	 */
	public async run(): Promise<boolean> {
		TurbineEventLoop.emit("log", "info", "PBRSC: Checking Start conditions.");

		const invalidStartConditionsCount = this.allRunConditions.filter((sc) => sc.canStart == false).length;

		if (invalidStartConditionsCount > 0) {
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

		this.addEvent(`PBR Started`);

		this.setState("started");
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
	public nextStep() {
		TurbineEventLoop.emit("log", "warning", `PBR: Next step triggered.`);
		this.currentRunningStep.end("skipped");
	}

	/** Add Events to the PBR history */
	public addEvent(event: string) {
		this.events.push({ data: event, time: Date.now() });
	}

	/**
	 * Set the PBR State
	 * @param state State to set
	 */
	private setState(state: PBRMode) {
		this.status.mode = state;
		TurbineEventLoop.emit("pbr.status.update", state);
		TurbineEventLoop.emit("ws.dirty", "cycle");
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
		const possibleRcEnding = this.runConditions.find((rc) => rc.name === reason);
		if (possibleRcEnding !== undefined && possibleRcEnding.startOnly === true) {
			TurbineEventLoop.emit("log", "warning", "PBR: Cannot end a cycle with a start only run condition.");
			return;
		}

		this.setState("ending");
		this.status.endReason = reason;

		this.steps.forEach((s) => s.crash("ending"));

		if (reason !== undefined) TurbineEventLoop.emit("log", "warning", "PBR: Triggered cycle end with reason: " + reason);

		this.addEvent(`Cycle ended with reason ${reason}.`);
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

		this.disposeEvents();

		//Append 1 to cycle count
		this.ctx!.maintenance.append("cycleCount", 1);

		this.setState("ended");
		this.status.endDate = Date.now();

		this.ctx!.logger.log("info", "PBR: Resetting all io gates to default values.");
		this.ctx!.io.resetAll();

		TurbineEventLoop.emit("log", "info", `PBR: Ended cycle ${this.name} with state: ${this.status.mode} & reason: ${this.status.endReason}.`);

		this.addEvent(`Cycle disposed.`);
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
		const currentPauseTime = this.pauseStartDate !== undefined ? Date.now() - this.pauseStartDate : 0;

		return this.totalPausedTime + currentPauseTime / 1000;
	}

	toJSON() {
		return {
			status: { ...this.status, progress: this.progress, estimatedRunTime: this.duration, overallPausedTime: this.overallPausedTime },

			//identifiers vars
			name: this.name,

			//Inside definers
			steps: this.steps,
			runConditions: this.allRunConditions.map((k) => k.toJSON()).filter((rc, i, a) => a.findIndex((rc2) => rc2.name === rc.name) === i),

			//internals
			currentStepIndex: this.currentStepIndex,

			//statics
			profile: this.profile,

			//additional informations
			additionalInfo: this.additionalInfo,

			events: this.events,
		};
	}
}
