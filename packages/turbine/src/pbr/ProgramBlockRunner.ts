import type { PBRMode, PBRStatus, PBRTimer, PBRVariable } from "$types/hydrated/cycle/ProgramBlockRunnerHydrated";
import type { ProgramBlockRunner as ProgramBlockRunnerConfig } from "$types/spec/cycle/ProgramBlockRunner";
import type { ProfileHydrated } from "$types/hydrated/profiles";
import type { PBRStepResult } from "$types/spec/cycle/PBRStep";

import { ProgramBlockStep } from "./ProgramBlockStep";
import { PBRRunCondition } from "./PBRSecurityCondition";
import { TurbineEventLoop } from "../events";
import { callbackWithTimeout } from "../utils/callbackWithTimeout";
import type { ServiceRegistry } from "../services/interfaces";
import type { PBRContext } from "../services/PBRContext";
import { PBRContextImpl } from "../services/PBRContextImpl";

/**
 * Program Block Runner
 * @desc Transforms JSON Blocks into machine instructions.
 */
export class ProgramBlockRunner
{
    pausable: boolean;

    status: PBRStatus = { mode: "creating", pausable: false };

    name: string;
    profileRequired: boolean;

    variables: Array<PBRVariable> = [];
    timers: (PBRTimer & {timer?: ReturnType<typeof setInterval>})[] = [];
    
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

    events: Array<{ data: string, time: number }> = [];

    /** Stored listener references for targeted removal in disposeEvents() */
    private _onProfileRead!: (options: { callback?: (profile?: ProfileHydrated) => void | Promise<void> }) => void;
    private _onTimerStart!: (timer: PBRTimer & { timer?: ReturnType<typeof setInterval> }) => void;
    private _onTimerExists!: (options: { timerName: string; callback?: (exists: boolean) => void | Promise<void> }) => void;
    private _onPause!: () => void;
    private _onResume!: () => Promise<void>;
    private _onSetPausable!: (pausable: boolean) => void;
    private _onTimerStop!: (options: { timerName: string; callback?: (stopped: boolean) => void | Promise<void> }) => void;
    private _onVariableRead!: (options: { name: string; callback?: (value: number) => void | Promise<void> }) => void;
    private _onVariableWrite!: (options: { name: string; value: number }) => void;
    private _onStop!: (reason: string) => void;

    /** PBR Context for dependency injection into blocks */
    ctx?: PBRContext;

    /** Pause utils */
    ioPauseSnapshot: Record<string, number> = {};

    totalPausedTime = 0;
    pauseStartDate?: number;

    constructor(object: ProgramBlockRunnerConfig, profile?: ProfileHydrated, serviceRegistry?: ServiceRegistry)
    {
         TurbineEventLoop.emit('log', 'info', "PBR: Building PBR...");

        // Create PBRContext if services are available
        if (serviceRegistry) {
            this.ctx = new PBRContextImpl(serviceRegistry);
        }

        this.name = object.name;
        this.profileRequired = object.profileRequired;
        this.profile = profile;
        this.additionalInfo = object.additionalInfo;

        this.pausable = object.pausable ?? false;

        if(this.profile === undefined)
            TurbineEventLoop.emit("log", "info", "PBR: This PBR is build without any profile.");

        this.registerEvents();

        // Bind PBR state to context (must be after registerEvents so end() is available)
        if (this.ctx instanceof PBRContextImpl) {
            (this.ctx as PBRContextImpl).bindPBR({
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
            
        for(const sc of object.runConditions)
            this.runConditions.push(new PBRRunCondition(sc, (data) => {
                TurbineEventLoop.emit(`pbr.stop`, `security-${data.name}`)
            }));

        for(const step of object.steps)
            this.steps.push(new ProgramBlockStep(this, step, this.ctx));
        
        this.setState("created");
        TurbineEventLoop.emit("log", "info", "PBR: Finished building PBR.");

        this.duration = this.steps.filter(s => s.isEnabled.data == 1).reduce((p, c) => p += c.duration, 0);

        this.addEvent(`PBR Created, estimated duration ${this.duration}s`);
    }

    /** Register events of this `PBR` */
    private registerEvents()
    {
        this._onProfileRead = ({callback}) => {
            callback?.(this.profile);
        };
        TurbineEventLoop.on("pbr.profile.read", this._onProfileRead);

        this._onTimerStart = (timer) => {
            if(this.timers.find(k => k.name === timer.name)?.enabled === true)
            {
                TurbineEventLoop.emit("log", "warning", `PBR: Found a timer with ${timer.name} already active, ignoring.`);
                return;
            }
            this.timers.push(timer);
        };
        TurbineEventLoop.on("pbr.timer.start", this._onTimerStart);

        this._onTimerExists = (options) => {
            options.callback?.(this.timers.find(k => k.name === options.timerName) !== undefined);
        };
        TurbineEventLoop.on("pbr.timer.exists", this._onTimerExists);

        this._onPause = () => {

            if(this.pausable === false)
            {
                TurbineEventLoop.emit("log", "warning", "PBR: Tried to pause a cycle that is not pausable.");
                return;
            }

            if(this.status.mode === "paused")
            {
                TurbineEventLoop.emit("log", "warning", "PBR: Tried to pause a cycle that is already paused.");
                return;
            }

            if(this.status.mode !== "started")
            {
                TurbineEventLoop.emit("log", "warning", "PBR: Tried to pause a cycle that is not started.");
                return;
            }

            this.pauseStartDate = Date.now();
            this.setState("paused");

            TurbineEventLoop.emit("io.snapshot", ({ callback: (snapshot: Record<string, number>) => {
                this.ioPauseSnapshot = structuredClone(snapshot);
                TurbineEventLoop.emit("io.resetAll");
            }}));

            TurbineEventLoop.emit("log", "warning", "PBR: Paused cycle.");

        };
        TurbineEventLoop.on("pbr.pause", this._onPause);

        this._onResume = async () => {

            if(this.pausable === false)
            {
                TurbineEventLoop.emit("log", "warning", "PBR: Tried to resume a cycle that is not pausable.");
                return;
            }

            if(this.status.mode === "started")
            {
                TurbineEventLoop.emit("log", "warning", "PBR: Tried to resume a cycle that is already started.");
                return;
            }

            if(this.status.mode !== "paused")
            {
                TurbineEventLoop.emit("log", "warning", "PBR: Tried to resume a cycle that is not paused.");
                return;
            }

            this.setState("started");

            for(const io in this.ioPauseSnapshot)
            {
                await callbackWithTimeout<void>(
                    (resolve) => {
                        TurbineEventLoop.emit(`io.update.${io}`, { value: this.ioPauseSnapshot[io], callback: () => resolve() });
                    },
                    5000,
                    `PBR.resume io.update.${io}`
                ).catch(err => {
                    TurbineEventLoop.emit("log", "error", `PBR: Resume IO restore failed: ${(err as Error).message}`);
                });
            }

            this.totalPausedTime += (Date.now() - (this.pauseStartDate ?? 0)) / 1000;
            this.pauseStartDate = undefined;

            TurbineEventLoop.emit("log", "warning", "PBR: Resumed cycle.");
        };
        TurbineEventLoop.on("pbr.resume", this._onResume);

        this._onSetPausable = (pausable: boolean) => {

            if(this.pausable === false)
            {
                TurbineEventLoop.emit("log", "trace", "PBR: Tried to set a cycle pausable when it's not.");
                return;
            }

            this.status.pausable = pausable;
        };
        TurbineEventLoop.on("pbr.setPausable", this._onSetPausable);

        this._onTimerStop = (options) => {
            const timer = this.timers.find(t => options.timerName === t.name);

            if(timer === undefined)
            {
                options.callback?.(false);
                TurbineEventLoop.emit("log", "warning", `PBR: Tried to stop a timer (${options.timerName}) that doesn't exist.`);
                return;
            }

            clearInterval(timer.timer);
            this.timers = this.timers.filter(k => k.name !== timer.name);

            options.callback?.(true);
        };
        TurbineEventLoop.on("pbr.timer.stop", this._onTimerStop);

        this._onVariableRead = ({ name, callback }) => {
            if(name === "currentStepCount")
                callback?.(this.currentRunningStep.runCount);
            else
                callback?.(this.variables.find(v => v.name === name)?.value ?? 0);
        };
        TurbineEventLoop.on("pbr.variable.read", this._onVariableRead);

        this._onVariableWrite = ({ name, value }) => {
            const pbrVar = this.variables.find(k => k.name === name);

            if(pbrVar)
                pbrVar.value = value;
            else
                this.variables.push({ name, value });
        };
        TurbineEventLoop.on("pbr.variable.write", this._onVariableWrite);

        this._onStop = (reason) => this.end(reason);
        TurbineEventLoop.on("pbr.stop", this._onStop);
    }

    /** Removes this PBR instance's event listeners (not all listeners globally). */
    private disposeEvents()
    {
        TurbineEventLoop.removeListener("pbr.profile.read", this._onProfileRead);
        TurbineEventLoop.removeListener("pbr.timer.exists", this._onTimerExists);
        TurbineEventLoop.removeListener("pbr.timer.stop", this._onTimerStop);
        TurbineEventLoop.removeListener("pbr.timer.start", this._onTimerStart);
        TurbineEventLoop.removeListener("pbr.variable.write", this._onVariableWrite);
        TurbineEventLoop.removeListener("pbr.variable.read", this._onVariableRead);
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
    public async run(): Promise<boolean>
    {
         TurbineEventLoop.emit('log', 'info', "PBRSC: Checking Start conditions.");

        const invalidStartConditionsCount = this.allRunConditions.filter((sc) => sc.canStart == false).length;

        if(invalidStartConditionsCount > 0)
        {
             TurbineEventLoop.emit('log', 'error', "PBRSC: Start conditions are not valid.");
            return false;
        }

         TurbineEventLoop.emit('log', 'info', "PBRSC: Start conditions are valid.");
         TurbineEventLoop.emit('log', 'info', "PBRSC: Removing start conditions only used at start.");

        this.runConditions.forEach(sc => {
            if(sc.startOnly === true)
            {
                sc.dispose();
                 TurbineEventLoop.emit('log', 'info', ` ↳ Removed ${sc.name}`);
            }
        });

         TurbineEventLoop.emit('log', 'info', `PBR: Started cycle ${this.name}.`);

        this.addEvent(`PBR Started`);

        this.setState("started");
        this.status.startDate = Date.now();

        while(this.currentStepIndex < this.steps.length)
        {
            let result: PBRStepResult | null = null;
            
            if(!["ended", "ending"].includes(this.status.mode))
                result = await this.steps[this.currentStepIndex].execute();
            else
                break;

            if(result === "next")
            {
                 TurbineEventLoop.emit('log', 'info', "PBR: Step ended, going to next step.");
                this.currentStepIndex++;
            }
            else
            {
                 TurbineEventLoop.emit('log', 'info', `PBR: Ended step asked to go to step: ${this.steps[result].name}.`);

                if(this.currentStepIndex < result)
                {
                    // The starting loop index is set to currentStepIndex + 1 because the current step has already ended, it prevents PBR to set the step state to "skipped" when it's not.
                    for(let i = (this.currentStepIndex + 1); i < result; i++)
                        this.steps[i].endReason = "skipped";
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
    public nextStep()
    {
         TurbineEventLoop.emit('log', 'warning', `PBR: Next step triggered.`);
        this.currentRunningStep.end("skipped");
    }

    /** Add Events to the PBR history */
    public addEvent(event: string)
    {
        this.events.push({ data: event, time: Date.now() });
    }

    /** 
     * Set the PBR State
     * @param state State to set
     */
    private setState(state: PBRMode)
    {
        this.status.mode = state;
        TurbineEventLoop.emit('pbr.status.update', state);
    }

    /**
     * Ends the cycle
     * @param reason End reason
     */
    public end(reason: string)
    {
        if(this.status.mode !== "started")
        {
            TurbineEventLoop.emit("log", "warning", "PBR: Cannot end a cycle that has not started.");
            return;
        }

        /** Avoid ending cycle with a ghost startonly run condition */
        const possibleRcEnding = this.runConditions.find(rc => rc.name === reason);
        if(possibleRcEnding !== undefined && possibleRcEnding.startOnly === true)
        {
            TurbineEventLoop.emit("log", "warning", "PBR: Cannot end a cycle with a start only run condition.");
            return;
        }

        this.setState("ending");
        this.status.endReason = reason;

        this.steps.forEach(s => s.crash("ending"));

        if(reason !== undefined)
             TurbineEventLoop.emit('log', 'warning', "PBR: Triggered cycle end with reason: " + reason);

        this.addEvent(`Cycle ended with reason ${reason}.`);
    }

    /** Dispose the cycle before its deletion */
    public dispose()
    {
        if(this.status.endReason === undefined)
            this.status.endReason = "finished";
        
         TurbineEventLoop.emit('log', 'info', "PBR: Disposing cycle.");
        if(this.currentStepIndex < this.steps.length)
        {
             TurbineEventLoop.emit('log', 'error', `PBR: Program ended before all steps were executed.`);

            //Removing 1 to runCount because the step was stopped before its end
            const s = this.steps.at(this.currentStepIndex)
            if(s !== undefined)
            {
                if(s.type == "multiple" && s.runCount !== undefined)
                {
                     TurbineEventLoop.emit('log', 'error', `PBR: Last executed step was a multiple step. Removing 1 multiple step iteration.`);
                    s.runCount--;
                }
            }
        }

        //Removing Start conditions timers
        if(this.runConditions.length > 0)
        {
             TurbineEventLoop.emit('log', 'info', "PBR: Removing Start Conditions checks.");
            for(const sc of this.runConditions)
                sc.dispose();
        }

        //Clearing timer blocks
        if(this.timers.length > 0)
        {
             TurbineEventLoop.emit('log', 'info', "PBR: Clearing timers.");
            for(const timer of this.timers)
            {
                 TurbineEventLoop.emit('log', 'info', " ↳ Clearing timer: " + timer.name);
                clearInterval(timer.timer);
            }
        }

        // Dispose steps (removes listeners from all blocks, steps, and step run conditions)
        TurbineEventLoop.emit('log', 'info', "PBR: Disposing steps and blocks.");
        for (const step of this.steps) {
            step.dispose();
        }

        this.disposeEvents();
        
        //Append 1 to cycle count
        TurbineEventLoop.emit(`maintenance.append.cycleCount`, 1);

        this.setState("ended");
        this.status.endDate = Date.now();

         TurbineEventLoop.emit('log', 'info', "PBR: Resetting all io gates to default values.");
        TurbineEventLoop.emit("io.resetAll");

         TurbineEventLoop.emit('log', 'info', `PBR: Ended cycle ${this.name} with state: ${this.status.mode} & reason: ${this.status.endReason}.`);

        this.addEvent(`Cycle disposed.`);
    }

    /** Compute progress of the cycle */
    public get progress()
    {
        return (Date.now() / (this.status.startDate ?? 1)) / (this.duration + this.overallPausedTime);
    }

    /** Return current running step reference */
    public get currentRunningStep(): ProgramBlockStep
    {        
        return this.steps[this.currentStepIndex];
    }

    get allRunConditions(): Array<PBRRunCondition>
    {
        return [...this.runConditions, ...this.steps.flatMap(s => s.runConditions).filter((s): s is PBRRunCondition => s !== undefined)];
    }

    get overallPausedTime(): number
    {
        const currentPauseTime = (this.pauseStartDate !== undefined) ? (Date.now() - this.pauseStartDate) : 0;

        return this.totalPausedTime + (currentPauseTime / 1000);
    }

    toJSON()
    {
        return {
            status: {...this.status, progress: this.progress, estimatedRunTime: this.duration, overallPausedTime: this.overallPausedTime },

            //identifiers vars
            name: this.name,
            
            //Inside definers
            steps: this.steps,
            runConditions: this.allRunConditions.map(k => k.toJSON()).filter((rc, i, a) => a.findIndex(rc2 => rc2.name === rc.name) === i),

            //internals
            currentStepIndex: this.currentStepIndex,

            //statics
            profile: this.profile,

            //additional informations
            additionalInfo: this.additionalInfo,

            events: this.events
        }
    }
}