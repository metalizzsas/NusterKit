import type { IAdditionalInfoHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/IAddtionalInfoHydrated";
import type { IPBRStatus, IProgramBlockRunnerHydrated, IProgramTimer, IProgramVariable } from "@metalizzsas/nuster-typings/build/hydrated/cycle/IProgramBlockRunnerHydrated";
import type { IProfileHydrated } from "@metalizzsas/nuster-typings/build/hydrated/profile";
import type { IProgramBlockRunner } from "@metalizzsas/nuster-typings/build/spec/cycle/IProgramBlockRunner";
import type { EProgramStepResult } from "@metalizzsas/nuster-typings/build/spec/cycle/IProgramStep";

import type { CountableMaintenance } from "../controllers/maintenance/CountableMaintenance";

import { LoggerInstance } from "../app";
import { IOController } from "../controllers/io/IOController";
import { MaintenanceController } from "../controllers/maintenance/MaintenanceController";
import { ManualModeController } from "../controllers/manual/ManualModeController";
import { ProgramBlockStep } from "./ProgramBlockStep";
import { PBRStartCondition } from "./startchain/PBRStartCondition";

/**
 * Program Block Runner
 * @desc Manages {@link pbr/ProgramBlocks.index}, {@link pbr/ParameterBlocks.index} & {@link ProgramBlockStep} to handle cycles
 */
export class ProgramBlockRunner implements IProgramBlockRunnerHydrated
{
    status: IPBRStatus;

    name: string;

    profileRequired: boolean;

    variables: Array<IProgramVariable> = [];
    timers: (IProgramTimer & {timer?: NodeJS.Timer})[] = [];
    
    /** **PBR** Steps */
    steps: Array<ProgramBlockStep> = [];

    /** Start conditions of the **PBR** */
    startConditions: Array<PBRStartCondition> = [];

    /** Index of the current step being runt */
    currentStepIndex = 0;

    /** Profile assignated to this **PBR** */
    profile?: IProfileHydrated;

    additionalInfo?: Array<IAdditionalInfoHydrated>;

    manualModeStatesBeforeStart: Record<string, number> = {};

    /**
     * Function to explore profile fields
     */
    profileExplorer?: (name: string) => number | boolean;

    constructor(object: IProgramBlockRunner, profile?: IProfileHydrated)
    {
        this.status = { mode: "created" };

        LoggerInstance.info("PBR: Building PBR...");

        this.profileRequired = object.profileRequired;

        this.profile = profile;

        if(this.profile === undefined)
            LoggerInstance.warn("PBR: This PBR is build without any profile.");
        else
            this.profileExplorer = (name: string) => this.profile?.values.find(v => v.name == name)?.value ?? 0;

        //properties assignment
        this.name = object.name;

        if(object.additionalInfo)
            this.additionalInfo = object.additionalInfo.map(k => { return {...k, value: IOController.getInstance().gFinder(k.value)!}})

        LoggerInstance.info("PBR: Finished building PBR.");

        // TODO: ProgramBlocks that needs PBRInstance are delayed because otherwise, they may find an undefined PBR Instance.
        setTimeout(() => this.fill(object), 500);
    }

    private fill(object: IProgramBlockRunner)
    {
        LoggerInstance.info("PBR: Filling data.");

        //steps and watchdog
        for(const sc of object.startConditions)
            this.startConditions.push(new PBRStartCondition(sc, this));

        for(const step of object.steps)
            this.steps.push(new ProgramBlockStep(this, step));
        
        LoggerInstance.info("PBR: Finished filling data");
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

        LoggerInstance.info(`PBR: Will disable manual modes that are enabled.`);
        ManualModeController.getInstance().manualModes.forEach(m => { 
            this.manualModeStatesBeforeStart[m.name] = structuredClone(m.state);

            if(m.state != 0)
            {
                LoggerInstance.info(` ↳ Settings ${m.name} to 0.`);
                m.setValue(0); 
            }
        });

        this.status.mode = "started";
        this.status.startDate = Date.now();

        while(this.currentStepIndex < this.steps.length)
        {
            let result: EProgramStepResult | null = null;
            
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
     * Ends the cycle
     * @param reason End reason
     */
    public end(reason: string)
    {
        if(["ended", "ending"].includes(this.status.mode))
            return;

        this.status.mode = "ending";
        this.status.endReason = reason;

        this.steps.forEach(s => s.state = "ending");

        if(reason !== undefined)
            LoggerInstance.warn("PBR: Triggered cycle end with reason: " + reason);
    }

    public async dispose()
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
        
        //Append 1 to cycle count
        const m = MaintenanceController.getInstance().tasks.find((m) => m.name == "cycleCount") as CountableMaintenance | undefined;
        m?.append(1);

        this.status.mode = "ended";
        this.status.endDate = Date.now();

        LoggerInstance.info("PBR: Resetting all io gates to default values.");
        for(const g of IOController.getInstance().gates.filter(g => g.bus == "out"))
        {
            await g.write(g.default);
        }

        if(Object.keys(this.manualModeStatesBeforeStart).length > 0)
        {
            LoggerInstance.info(`PBR: Re-enabling manual modes that were disabled before.`);
            for(const m in this.manualModeStatesBeforeStart)
            {
                const previousValue = this.manualModeStatesBeforeStart[m];
                const mode = ManualModeController.getInstance().find(m);
    
                if(previousValue != 0 && mode !== undefined)
                {
                    LoggerInstance.info(` ↳ Settings ${mode.name} to ${previousValue}.`);
                    mode.setValue(structuredClone(previousValue));
                }
            }
        }
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
        let estimation = 0;

        for(const step of this.steps)
        {
            estimation += step.duration
        }
        return estimation;
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