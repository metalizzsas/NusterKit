import { EPBRMode } from "@metalizzsas/nuster-typings/src/spec/cycle/IProgramBlockRunner";
import { EProgramStepResult, EProgramStepState, EProgramStepType, IProgramStepRunner } from "@metalizzsas/nuster-typings/src/spec/cycle/IProgramStep";
import { LoggerInstance } from "../app";
import { NumericParameterBlocks } from "./ParameterBlocks";
import { ParameterBlockRegistry } from "./ParameterBlocks/ParameterBlockRegistry";
import { ProgramBlockRunner } from "./ProgramBlockRunner";
import { ProgramBlocks } from "./ProgramBlocks";
import { ProgramBlockRegistry } from "./ProgramBlocks/ProgramBlockRegistry";

export class ProgramBlockStep implements IProgramStepRunner
{
    private pbrInstance: ProgramBlockRunner;

    name: string;

    /** Current step state, Setting this flag to `ENDING` should end the step faster */
    state: EProgramStepState = EProgramStepState.CREATED;
    type: EProgramStepType = EProgramStepType.SINGLE;
    
    isEnabled: NumericParameterBlocks;
    duration: NumericParameterBlocks;
    
    startTime?: number;
    endTime?: number;
    
    runAmount?: NumericParameterBlocks;
    runCount?: number;
    
    blocks: ProgramBlocks[] = [];
    startBlocks: ProgramBlocks[] = [];
    endBlocks: ProgramBlocks[] = [];

    stepOvertimeTimer?: NodeJS.Timeout;
    
    constructor(pbrInstance: ProgramBlockRunner, obj: IProgramStepRunner)
    {
        this.pbrInstance = pbrInstance;
        this.name = obj.name;
        this.isEnabled = ParameterBlockRegistry(obj.isEnabled) as NumericParameterBlocks;
        this.duration = ParameterBlockRegistry(obj.duration) as NumericParameterBlocks;

        if(obj.runAmount)
        {
            this.runAmount = ParameterBlockRegistry(obj.runAmount) as NumericParameterBlocks;
            this.runCount = obj.runCount ?? 0;
            this.type = (this.runAmount?.data() ?? 0) > 1 ? EProgramStepType.MULTIPLE : EProgramStepType.SINGLE;
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
    }

    public async execute(): Promise<EProgramStepResult>
    {
        if(this.isEnabled.data() == 0)
        {
            LoggerInstance.warn(`PBS-${this.name}: Step is disabled.`);
            return EProgramStepResult.ENDED;
        }

        if(this.pbrInstance.status.mode == EPBRMode.ENDED)
        {
            LoggerInstance.warn(`PBS-${this.name}: Tried to execute step while cycle ended.`);
            return EProgramStepResult.ENDED;
        }

        LoggerInstance.info(`PBS-${this.name}: Started step.`);
        this.state = EProgramStepState.STARTED;

        //Disable step overtime timeout if the step duration is equal to -1
        if(this.duration.data() != -1)
            this.stepOvertimeTimer = setTimeout(() => {
                this.pbrInstance.end("stepOvertime"); 
                LoggerInstance.error(`PBS-${this.name}: Step has been too long. Triggering stepOvertime.`); 
            }, this.duration.data() * 2000);

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
        if(this.runAmount !== undefined && this.runCount !== undefined && this.runAmount.data() as number > 1)
        {
            this.runCount++;

            if(this.runCount && this.runAmount && (this.runCount == this.runAmount.data()))
            {
                this.state = EProgramStepState.ENDED;
                LoggerInstance.info(`PBS-${this.name}: Ended step with state ${EProgramStepResult.ENDED}`);
                this.endTime = Date.now();
                return EProgramStepResult.ENDED;
            }
            else
            {
                this.state = EProgramStepState.PARTIAL;
                LoggerInstance.info(`PBS-${this.name}: Ended step with state ${EProgramStepResult.ENDED}`);
                this.endTime = Date.now();
                return EProgramStepResult.PARTIAL_END;
            }   
        }
        else
        {
            this.state = EProgramStepState.ENDED;
            LoggerInstance.info(`PBS-${this.name}: Ended step with state ${EProgramStepResult.ENDED}`);
            this.endTime = Date.now();
            return EProgramStepResult.ENDED;
        }
    }

    get progress()
    {
        let progress = 0;

        //precalculate progress
        switch(this.state)
        {
            case EProgramStepState.STARTED:
            {
                if(this.startTime)
                {
                    if(this.duration.data() != -1)
                    {
                        progress = parseFloat(((Date.now() - this.startTime) / ((this.duration.data() as number) * 1000)).toFixed(2));
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
            case EProgramStepState.ENDED || EProgramStepState.PARTIAL:
            {
                progress = (this.type == EProgramStepType.SINGLE) ? 1 : 0;
                break;
            }
            default: {
                progress = 0;
                break;
            }
        }
        
        if((this.type == EProgramStepType.MULTIPLE) && this.runAmount)
        {
            return ((1 * progress) / (this.runAmount.data() as number)) + ((this.runCount || 0) / (this.runAmount.data() as number))
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
    
            startTime: this.startTime,
            endTime: this.endTime,
    
            runAmount: this.runAmount,
            runCount: this.runCount,

            startBlocks: this.startBlocks,
            endBlocks: this.endBlocks,
            
            blocks: this.blocks
        }
    }
}