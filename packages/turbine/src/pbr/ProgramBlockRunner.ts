import { IProfileHydrated } from "@metalizz/nuster-typings/src/hydrated/profile";
import { IProgramRunner, IPBRStatus, IProgramVariable, IProgramTimer, EPBRMode } from "@metalizz/nuster-typings/src/spec/cycle/IProgramBlockRunner";
import { EProgramStepResult, EProgramStepType, EProgramStepState } from "@metalizz/nuster-typings/src/spec/cycle/IProgramStep";
import { LoggerInstance } from "../app";
import { IOController } from "../controllers/io/IOController";
import { MaintenanceController } from "../controllers/maintenance/MaintenanceController";
import { ProgramBlockStep } from "./ProgramBlockStep";
import { PBRStartCondition } from "./startchain/PBRStartCondition";

/**
 * Program Block Runner
 * @desc Manages {@link pbr/ProgramBlocks.index}, {@link pbr/ParameterBlocks.index} & {@link ProgramBlockStep} to handle cycles
 * @class
 */
export class ProgramBlockRunner implements IProgramRunner
{
    status: IPBRStatus;

    name: string;

    profileRequired: boolean;

    variables: IProgramVariable[] = [];
    timers: (IProgramTimer & {timer?: NodeJS.Timer})[] = [];
    
    /** **PBR** Steps */
    steps: ProgramBlockStep[] = [];

    /** Start conditions of the **PBR** */
    startConditions: PBRStartCondition[] = [];

    /** Index of the current step being runt */
    currentStepIndex = 0;

    /** Profile assignated to this **PBR** */
    profile?: IProfileHydrated;

    /**
     * Function to explore profile fields
     */
    profileExplorer?: (name: string) => number | boolean;

    constructor(object: IProgramRunner, profile?: IProfileHydrated)
    {
        this.status = { mode: EPBRMode.CREATED };

        LoggerInstance.info("PBR: Building PBR...");

        this.profileRequired = object.profileRequired;

        //if this is defined it should be a cycle restart
        if(object.currentStepIndex)
            this.currentStepIndex = object.currentStepIndex;

        if(object.variables)
            this.variables = object.variables;

        if(object.timers)
            this.timers = object.timers;

        this.profile = profile;

        if(this.profile === undefined)
            LoggerInstance.warn("PBR: This PBR is build without any profile.");
        else
            this.profileExplorer = (name: string) => this.profile?.values.find(v => v.name == name)?.value ?? 0;

        //properties assignment
        this.name = object.name;

        //steps and watchdog
        for(const sc of object.startConditions)
            this.startConditions.push(new PBRStartCondition(sc, this));

        for(const step of object.steps)
            this.steps.push(new ProgramBlockStep(this, step));

        LoggerInstance.info("PBR: Finished building PBR.");
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

        for(const startCondition of this.startConditions)
        {
            const index = this.startConditions.indexOf(startCondition);
            if(startCondition.startOnly && index != -1)
            {
                this.startConditions.splice(index, 1);
                LoggerInstance.trace(` ↳ Removed ${startCondition.conditionName}`);
            }
        }

        LoggerInstance.info(`PBR: Started cycle ${this.name}.`);

        this.status.mode = EPBRMode.STARTED;
        this.status.startDate = Date.now();

        while(this.currentStepIndex < this.steps.length)
        {
            let result = null;
            
            // TypeScriptCompiler is not able to understand that status.mode can be changed externally
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore: disabled overlap checking
            if(this.status.mode != EPBRMode.ENDED || EPBRMode.ENDING)
                result = await this.steps[this.currentStepIndex].execute();
            else
                break;

            switch(result)
            {
                case EProgramStepResult.PARTIAL_END:
                {
                    //reset times at the end of a partial step
                    this.steps[this.currentStepIndex].resetTimes();

                    LoggerInstance.info("PBR: Partial step ended, fetching first multiple step.");

                    //if next step does not exists or next step is not a multiple step,
                    //return to first multiple step
                    if(this.steps[this.currentStepIndex + 1].type != EProgramStepType.MULTIPLE)
                    {
                        const j = this.steps.findIndex(step => step.type == EProgramStepType.MULTIPLE);

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
            if(this.status.mode != EPBRMode.ENDED)
                this.currentStepIndex++;
        }

        //this.end();
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
            this.currentRunningStep.state = EProgramStepState.ENDING;
    }

    /**
     * Ends the cycle
     * @param reason Optional end reason name
     */
    public end(reason: string)
    {
        if([EPBRMode.ENDED, EPBRMode.ENDING].includes(this.status.mode))
            return;

        this.status.mode = EPBRMode.ENDING;
        this.status.endReason = reason;

        this.steps.forEach(s => s.state = EProgramStepState.ENDING);

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
                if(s.type == EProgramStepType.MULTIPLE && s.runCount !== undefined)
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
            LoggerInstance.info("PBR: Cleaning timers.");
            for(const timer of this.timers)
            {
                LoggerInstance.info("PBR: Clearing timer: " + timer.name);
                if(timer.timer !== undefined)
                    clearInterval(timer.timer);
            }
        }
        
        //Append 1 to cycle count
        const m = MaintenanceController.getInstance().tasks.find((m) => m.name == "cycleCount");
        m?.append(1);

        this.status.mode = EPBRMode.ENDED;
        this.status.endDate = Date.now();

        LoggerInstance.info("PBR: Resetting all io gates to default values.");
        for(const g of IOController.getInstance().gates.filter(g => g.bus == "out"))
        {
            await g.write(g.default);
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
     */
    public get estimatedRunTime()
    {
        let estimation = 0;

        for(const step of this.steps)
        {
            estimation += step.duration.data()
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
            profile: this.profile
        }
    }
}