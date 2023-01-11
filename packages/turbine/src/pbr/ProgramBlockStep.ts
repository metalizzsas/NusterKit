import type { NumericParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { ProgramBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ProgramBlockHydrated";
import { LoggerInstance } from "../app";
import { ParameterBlockRegistry } from "./ParameterBlocks/ParameterBlockRegistry";
import type { ProgramBlockRunner } from "./ProgramBlockRunner";
import { ProgramBlockRegistry } from "./ProgramBlocks/ProgramBlockRegistry";
import type { PBRStepHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/PBRStepHydrated";
import type { PBRStep, PBRStepResult, PBRStepState, PBRStepType } from "@metalizzsas/nuster-typings/build/spec/cycle/PBRStep";

export class ProgramBlockStep implements PBRStepHydrated
{
    private pbrInstance: ProgramBlockRunner;

    name: string;

    /** Current step state, Setting this flag to `ENDING` should end the step faster */
    state: PBRStepState = "created";
    type: PBRStepType = "single";
    
    isEnabled: NumericParameterBlockHydrated;
    
    startTime?: number;
    endTime?: number;
    
    runAmount?: NumericParameterBlockHydrated;
    runCount?: number;
    
    blocks: Array<ProgramBlockHydrated> = [];
    startBlocks: Array<ProgramBlockHydrated> = [];
    endBlocks: Array<ProgramBlockHydrated> = [];

    stepOvertimeTimer?: NodeJS.Timeout;

    duration: number;
    
    constructor(pbrInstance: ProgramBlockRunner, obj: PBRStep)
    {
        this.pbrInstance = pbrInstance;
        this.name = obj.name;
        this.isEnabled = ParameterBlockRegistry.Numeric(obj.isEnabled);

        if(obj.runAmount)
        {
            this.runAmount = ParameterBlockRegistry.Numeric(obj.runAmount);
            this.runCount = 0;
            this.type = (this.runAmount?.data ?? 0) > 1 ? "multiple" : "single";
        }

        //Adding io starting blocks
        for(const startBlock of obj.startBlocks)
            this.startBlocks.push(ProgramBlockRegistry(startBlock));

        //Adding io ending blocks
        for(const endBlock of obj.endBlocks)
            this.endBlocks.push(ProgramBlockRegistry(endBlock));

        //adding program blocks
        for(const block of obj.blocks)
            this.blocks.push(ProgramBlockRegistry(block));

        this.duration = this.estimateRunTime();
    }

    public async execute(): Promise<PBRStepResult>
    {
        if(this.isEnabled.data == 0)
        {
            LoggerInstance.warn(`PBS-${this.name}: Step is disabled.`);
            return "ended";
        }

        if(this.pbrInstance.status.mode == "ended")
        {
            LoggerInstance.warn(`PBS-${this.name}: Tried to execute step while cycle ended.`);
            return "ended";
        }

        LoggerInstance.info(`PBS-${this.name}: Started step.`);
        this.state = "started";

        //Disable step overtime timeout if the step duration is equal to -1
        if(this.duration != Infinity)
            this.stepOvertimeTimer = setTimeout(() => {

                if(this.state == "started")
                {
                    LoggerInstance.error(`PBS-${this.name}: Step has been too long. Triggering stepOvertime.`); 
                    this.pbrInstance.end("stepOvertime"); 
                }
                else
                    LoggerInstance.warn(`PBS-${this.name}: Step overtime has been canceled because step was not running.`);
            }, this.duration * 2000);

        this.startTime = Date.now();

        LoggerInstance.info(`PBS-${this.name}: Executing io starter blocks.`);
        for(const io of this.startBlocks)
        {
            await io.execute();
        }

        LoggerInstance.info(`PBS-${this.name}: Executing step main blocks.`);
        for(const b of this.blocks)
        {
            await b.execute();
        }

        LoggerInstance.info(`${this.name}: Executing io ending blocks.`);
        for(const io of this.endBlocks)
        {
            await io.execute();
        }

        if(this.stepOvertimeTimer)
            clearTimeout(this.stepOvertimeTimer);

        //handling of multiple runned steps
        if(this.runAmount !== undefined && this.runCount !== undefined && this.runAmount.data > 1)
        {
            this.runCount++;

            if(this.runCount && this.runAmount && (this.runCount == this.runAmount.data))
            {
                this.state = "ended";
                LoggerInstance.info(`PBS-${this.name}: Ended step with state ${"ended"}`);
                this.endTime = Date.now();
                return "ended";
            }
            else
            {
                this.state = "partial";
                LoggerInstance.info(`PBS-${this.name}: Ended step with state ${"ended"}`);
                this.endTime = Date.now();
                return "partial";
            }   
        }
        else
        {
            this.state = "ended";
            LoggerInstance.info(`PBS-${this.name}: Ended step with state ${"ended"}`);
            this.endTime = Date.now();
            return "ended";
        }
    }

    /** Estimate the run time of this step */
    private estimateRunTime(): number
    {
        return [this.endBlocks, this.startBlocks, this.blocks].flatMap(k => k).reduce((p, c) => p + c.estimatedRunTime, 0);
    }

    get progress()
    {
        let progress = 0;

        //precalculate progress
        switch(this.state)
        {
            case "started":
            {
                if(this.startTime)
                {
                    if(this.duration != Infinity)
                    {
                        progress = parseFloat(((Date.now() - this.startTime) / ((this.duration) * 1000)).toFixed(2));
                        progress = (progress >= 1 ? 1 : progress);
                        break;
                    }
                    else
                    {
                        progress = -1;
                        break;
                    }
                }
                else
                {
                    progress = 0;
                    break;
                }
            }
            case "ended" || "partial":
            {
                progress = (this.type == "single") ? 1 : 0;
                break;
            }
            default: {
                progress = 0;
                break;
            }
        }
        
        if((this.type == "multiple") && this.runAmount)
        {
            return ((1 * progress) / (this.runAmount.data)) + ((this.runCount || 0) / (this.runAmount.data))
        }
        else
        {
            return progress;
        }
    }

    public resetTimes()
    {
        this.startTime = undefined;
        this.endTime = undefined;
    }

    toJSON()
    {

        return {
            name: this.name,
            state: this.state,
            type: this.type,
    
            isEnabled: this.isEnabled,
            duration: this.duration,

            progress: this.progress,
        
            runAmount: this.runAmount,
            runCount: this.runCount,

            startBlocks: this.startBlocks,
            endBlocks: this.endBlocks,
            
            blocks: this.blocks
        }
    }
}