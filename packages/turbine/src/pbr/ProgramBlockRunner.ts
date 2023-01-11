import type { PBRMode, PBRStatus, PBRTimer, PBRVariable, ProgramBlockRunnerHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/ProgramBlockRunnerHydrated";
import type { ProgramBlockRunner as ProgramBlockRunnerConfig } from "@metalizzsas/nuster-typings/build/spec/cycle/ProgramBlockRunner";
import type { ProfileHydrated } from "@metalizzsas/nuster-typings/build/hydrated/profiles";
import type { PBRStepResult } from "@metalizzsas/nuster-typings/build/spec/cycle/PBRStep";

import { LoggerInstance } from "../app";
import { ProgramBlockStep } from "./ProgramBlockStep";
import { PBRStartCondition } from "./startchain/PBRStartCondition";
import { TurbineEventLoop } from "../events";

/**
 * Program Block Runner
 * @desc Manages {@link ProgramBlocks}, {@link ParameterBlocks} & {@link ProgramBlockStep} to handle cycles
 */
export class ProgramBlockRunner implements ProgramBlockRunnerHydrated
{
    status: PBRStatus;

    name: string;

    profileRequired: boolean;

    variables: Array<PBRVariable> = [];
    timers: (PBRTimer & {timer?: NodeJS.Timer})[] = [];
    
    /** **PBR** Steps */
    steps: Array<ProgramBlockStep> = [];

    /** Start conditions of the **PBR** */
    startConditions: Array<PBRStartCondition> = [];

    /** Index of the current step being runt */
    currentStepIndex = 0;

    /** Profile assignated to this **PBR** */
    profile?: ProfileHydrated;

    additionalInfo?: Array<string>;

    constructor(object: ProgramBlockRunnerConfig, profile?: ProfileHydrated)
    {
        this.status = { mode: "creating" };

        LoggerInstance.info("PBR: Building PBR...");

        this.profileRequired = object.profileRequired;

        this.profile = profile;

        if(this.profile === undefined)
            LoggerInstance.warn("PBR: This PBR is build without any profile.");
        else
        {
            // Emit profile when asped by parameter blocks
            TurbineEventLoop.on("pbr.profile.read", ({callback}) => {
                callback?.(this.profile);
            });
        }
            
        //properties assignment
        this.name = object.name;

        this.additionalInfo = object.additionalInfo;

        LoggerInstance.info("PBR: Finished building PBR.");

        TurbineEventLoop.on(`pbr.timer.start`, (timer) => { this.timers.push(timer) });

        // TODO: ProgramBlocks that needs PBRInstance are delayed because otherwise, they may find an undefined PBR Instance.
        setTimeout(() => this.fill(object), 500);
    }

    private fill(object: ProgramBlockRunnerConfig)
    {
        LoggerInstance.info("PBR: Filling data.");

        //steps and watchdog
        for(const sc of object.startConditions)
            this.startConditions.push(new PBRStartCondition(sc, this));

        for(const step of object.steps)
            this.steps.push(new ProgramBlockStep(this, step));
        
        LoggerInstance.info("PBR: Finished filling data");

        this.setState("created");
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

        if(invalidStartConditionsCount > 0 && process.env.NODE_ENV == "production")
        {
            LoggerInstance.error("PBRSC: Start conditions are not valid.");
            return false;
        }

        LoggerInstance.info("PBRSC: Start conditions are valid.");
        LoggerInstance.info("PBRSC: Removing start conditions only used at start.");

        this.startConditions = this.startConditions.filter(sc => {
            if(sc.startOnly == true)
            {
                sc.stopTimer();
                LoggerInstance.info(` ↳ Removed ${sc.conditionName}`);
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
            
            // TypeScriptCompiler is not able to understand that status.mode can be changed externally
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore: disabled overlap checking
            if(this.status.mode != "ended")
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
        if(["ended", "ending"].includes(this.status.mode))
            return;

        this.setState("ending");
        this.status.endReason = reason;

        this.steps.forEach(s => s.state = "ending");

        TurbineEventLoop.emit("pbr.status.update", this.status.mode);

        if(reason !== undefined)
            LoggerInstance.warn("PBR: Triggered cycle end with reason: " + reason);
    }

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
                sc.stopTimer();
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

        TurbineEventLoop.removeAllListeners("pbr.profile.read");
        
        //Append 1 to cycle count
        TurbineEventLoop.emit(`maintenance.append.cycleCount`, 1);

        this.setState("ended");
        this.status.endDate = Date.now();

        LoggerInstance.info("PBR: Resetting all io gates to default values.");
        TurbineEventLoop.emit("io.resetAll");

        LoggerInstance.info(`PBR: Ended cycle ${this.name} with state: ${this.status.mode} & reason: ${this.status.endReason}.`);
    }

    /**
     * Compute progress of the cycle
     */
    public get progress()
    {
        let duration = 0;

        for(const step of this.steps)
            duration += step.progress;

        return duration / this.steps.length;
    }

    /**
     * Compute the estimated cycle run time
     * TODO: This should be calculated once instead on each time this.toJSON() is called
     * TODO: This should also take in account the steps with multiple runs
     */
    public get estimatedRunTime()
    {
        return this.steps.filter(s => s.isEnabled.data == 1).reduce((p, c) => p += c.duration, 0);
    }

    /**
     * Return current running step reference
     */
    public get currentRunningStep(): ProgramBlockStep
    {
        
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.steps.at(this.currentStepIndex)!;
    }

    toJSON()
    {
        return {
            status: {...this.status, progress: this.progress, estimatedRunTime: this.estimatedRunTime},

            //identifiers vars
            name: this.name,
            
            //Inside definers
            steps: this.steps,
            startConditions: this.startConditions,

            //internals
            currentStepIndex: this.currentStepIndex,

            //statics
            profile: this.profile,

            //additional informations
            additionalInfo: this.additionalInfo
        }
    }
}