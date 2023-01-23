import type { PBRMode, PBRStatus, PBRTimer, PBRVariable } from "@metalizzsas/nuster-typings/build/hydrated/cycle/ProgramBlockRunnerHydrated";
import type { ProgramBlockRunner as ProgramBlockRunnerConfig } from "@metalizzsas/nuster-typings/build/spec/cycle/ProgramBlockRunner";
import type { ProfileHydrated } from "@metalizzsas/nuster-typings/build/hydrated/profiles";
import type { PBRStepResult } from "@metalizzsas/nuster-typings/build/spec/cycle/PBRStep";

import { LoggerInstance } from "../app";
import { ProgramBlockStep } from "./ProgramBlockStep";
import { PBRSecurityCondition } from "./PBRSecurityCondition";
import { TurbineEventLoop } from "../events";

/**
 * Program Block Runner
 * @desc Transforms JSON Blocks into machine instructions.
 */
export class ProgramBlockRunner
{
    status: PBRStatus = { mode: "creating" };

    name: string;
    profileRequired: boolean;

    variables: Array<PBRVariable> = [];
    timers: (PBRTimer & {timer?: NodeJS.Timer})[] = [];
    
    /** **PBR** Steps */
    steps: Array<ProgramBlockStep> = [];

    /** Start conditions of the **PBR** */
    startConditions: Array<PBRSecurityCondition> = [];

    /** Index of the current step being runt */
    currentStepIndex = 0;

    /** Profile assignated to this **PBR** */
    profile?: ProfileHydrated;

    additionalInfo?: Array<string>;

    /** Estimated duration */
    duration: number;

    constructor(object: ProgramBlockRunnerConfig, profile?: ProfileHydrated)
    {
        LoggerInstance.info("PBR: Building PBR...");

        this.name = object.name;
        this.profileRequired = object.profileRequired;
        this.profile = profile;
        this.additionalInfo = object.additionalInfo;

        if(this.profile === undefined)
            TurbineEventLoop.emit("log", "info", "PBR: This PBR is build without any profile.");

        this.registerEvents();
            
        for(const sc of object.startConditions)
            this.startConditions.push(new PBRSecurityCondition(sc));

        for(const step of object.steps)
            this.steps.push(new ProgramBlockStep(this, step));
        
        this.setState("created");
        TurbineEventLoop.emit("log", "info", "PBR: Finished building PBR.");

        this.duration = this.steps.filter(s => s.isEnabled.data == 1).reduce((p, c) => p += c.duration, 0);
    }

    /** Register events of this `PBR` */
    private registerEvents()
    {
        TurbineEventLoop.on("pbr.profile.read", ({callback}) => {
            callback?.(this.profile);
        });

        TurbineEventLoop.on(`pbr.timer.start`, (timer) => {
            if(this.timers.find(k => k.name === timer.name)?.enabled === true)
            {
                TurbineEventLoop.emit("log", "warning", `PBR: Found a timer with ${timer.name} already active, ignoring.`);
                return;
            }
            this.timers.push(timer) 
        });

        TurbineEventLoop.on("pbr.timer.stop", (options) => {
            const timer = this.timers.find(t => options.timerName === t.name)
            
            if(timer === undefined)
            {
                options.callback?.(false);
                return;
            }

            clearInterval(timer.timer);
            this.timers = this.timers.filter(k => k.name !== timer.name); 

            options.callback?.(true);
        });

        TurbineEventLoop.on(`pbr.variable.read`, ({ name, callback }) => {
            if(name === "currentStepCount")
                callback?.(this.currentRunningStep.runCount);
            else
                callback?.(this.variables.find(v => v.name === name)?.value ?? 0)
        });

        TurbineEventLoop.on("pbr.variable.write", ({ name, value }) => {
            const pbrVar = this.variables.find(k => k.name === name);

            if(pbrVar)
                pbrVar.value = value;
            else
                this.variables.push({ name, value });

        });

        /** Listen for Stop events */
        TurbineEventLoop.on('pbr.stop', (reason) => this.end(reason));
    }

    /** Removes all events listeners namespaced with `pbr`. */
    private disposeEvents()
    {
        TurbineEventLoop.removeAllListeners('pbr.profile.read');
        TurbineEventLoop.removeAllListeners('pbr.timer.stop');
        TurbineEventLoop.removeAllListeners('pbr.timer.start');
        TurbineEventLoop.removeAllListeners('pbr.variable.write');
        TurbineEventLoop.removeAllListeners('pbr.variable.read');
        TurbineEventLoop.removeAllListeners('pbr.stop');
        TurbineEventLoop.removeAllListeners('pbr.status.update');
    }

    /**
     * Runs the cycle
     * @async
     * @returns A boolean stating if the cycle is successful or not
     */
    public async run(): Promise<boolean>
    {
        LoggerInstance.info("PBRSC: Checking Start conditions.");

        const invalidStartConditionsCount = this.startConditions.filter((sc) => sc.canStart == false).length;

        if(invalidStartConditionsCount > 0)
        {
            LoggerInstance.error("PBRSC: Start conditions are not valid.");
            return false;
        }

        LoggerInstance.info("PBRSC: Start conditions are valid.");
        LoggerInstance.info("PBRSC: Removing start conditions only used at start.");

        this.startConditions = this.startConditions.filter(sc => {
            if(sc.startOnly == true)
            {
                sc.dispose();
                LoggerInstance.info(` ↳ Removed ${sc.name}`);
                return false;
            }
            return true;
            
        });

        LoggerInstance.info(`PBR: Started cycle ${this.name}.`);

        this.setState("started");
        this.status.startDate = Date.now();

        while(this.currentStepIndex < this.steps.length)
        {
            let result: PBRStepResult | null = null;
            
            if(!["ended", "ending"].includes(this.status.mode))
                result = await this.steps[this.currentStepIndex].execute();
            else
                break;

            switch(result)
            {
                case "partial":
                {
                    //reset times at the end of a partial step
                    this.steps[this.currentStepIndex].resetTimes();

                    LoggerInstance.info("PBR: Partial step ended, fetching first multiple step.");

                    //if next step does not exists or next step is not a multiple step,
                    //return to first multiple step
                    if(this.steps[this.currentStepIndex + 1].type != "multiple")
                    {
                        const j = this.steps.findIndex(step => step.type == "multiple");

                        if(j != -1)
                        {
                            LoggerInstance.info("PBR: Next partial step: " + this.steps[j].name);
                            this.currentStepIndex = j;
                        }
                        else
                        {
                            LoggerInstance.error("PBR: No first multiple step found.");
                            this.end("partial-definition-error");
                        }
                        continue;
                    }
                    else
                    {
                        LoggerInstance.info("PBR: Next partial step not found, going next step.");
                    }
                }
            }
            
            if(this.status.mode !== "ended")
                this.currentStepIndex++;
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
        LoggerInstance.warn("PBR: Next step triggered");
        if(this.currentRunningStep)
            this.currentRunningStep.state = "ending";
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

        this.setState("ending");
        this.status.endReason = reason;

        this.steps.forEach(s => s.state = "ending");

        if(reason !== undefined)
            LoggerInstance.warn("PBR: Triggered cycle end with reason: " + reason);
    }

    /** Dispose the cycle before its deletion */
    public dispose()
    {
        if(this.status.endReason === undefined)
            this.status.endReason = "finished";
        
        LoggerInstance.info("PBR: Disposing cycle.");
        if(this.currentStepIndex < this.steps.length)
        {
            LoggerInstance.error(`PBR: Program ended before all steps were executed.`);

            //Removing 1 to runCount because the step was stopped before its end
            const s = this.steps.at(this.currentStepIndex)
            if(s !== undefined)
            {
                if(s.type == "multiple" && s.runCount !== undefined)
                {
                    LoggerInstance.error(`PBR: Last executed step was a multiple step. Removing 1 multiple step iteration.`);
                    s.runCount--;
                }
            }
        }

        //Removing Start conditions timers
        if(this.startConditions.length > 0)
        {
            LoggerInstance.info("PBR: Removing Start Conditions checks.");
            for(const sc of this.startConditions)
                sc.dispose();
        }

        //Clearing timer blocks
        if(this.timers.length > 0)
        {
            LoggerInstance.info("PBR: Clearing timers.");
            for(const timer of this.timers)
            {
                LoggerInstance.info(" ↳ Clearing timer: " + timer.name);
                if(timer.timer !== undefined)
                    clearInterval(timer.timer);
            }
        }

        this.disposeEvents();
        
        //Append 1 to cycle count
        TurbineEventLoop.emit(`maintenance.append.cycleCount`, 1);

        this.setState("ended");
        this.status.endDate = Date.now();

        LoggerInstance.info("PBR: Resetting all io gates to default values.");
        TurbineEventLoop.emit("io.resetAll");

        LoggerInstance.info(`PBR: Ended cycle ${this.name} with state: ${this.status.mode} & reason: ${this.status.endReason}.`);
    }

    /** Compute progress of the cycle */
    public get progress()
    {
        return (Date.now() / (this.status.startDate ?? 1)) / this.duration;
    }

    /** Return current running step reference */
    public get currentRunningStep(): ProgramBlockStep
    {        
        return this.steps[this.currentStepIndex];
    }

    toJSON()
    {
        return {
            status: {...this.status, progress: this.progress, estimatedRunTime: this.duration},

            //identifiers vars
            name: this.name,
            
            //Inside definers
            steps: this.steps,
            startConditions: this.startConditions.map(k => k.toJSON()),

            //internals
            currentStepIndex: this.currentStepIndex,

            //statics
            profile: this.profile,

            //additional informations
            additionalInfo: this.additionalInfo
        }
    }
}