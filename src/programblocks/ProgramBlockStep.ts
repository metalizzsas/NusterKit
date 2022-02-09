import { PBRMode } from "../interfaces/IProgramBlockRunner";
import { IProgramStep, ProgramStepState, ProgramStepType, ProgramStepResult } from "../interfaces/IProgramStep";
import { ParameterBlock, ParameterBlockRegistry } from "./ParameterBlocks";
import { ProgramBlockRunner } from "./ProgramBlockRunner";
import { ProgramBlock, ProgramBlockRegistry } from "./ProgramBlocks";

export class ProgramBlockStep implements IProgramStep
{
    private pbrInstance: ProgramBlockRunner;

    name: string;

    state: ProgramStepState = ProgramStepState.WAITING;
    type: ProgramStepType = ProgramStepType.SINGLE;
    
    isEnabled: ParameterBlock;
    duration: ParameterBlock;
    
    startTime?: number;
    endTime?: number;
    
    runAmount?: ParameterBlock;
    runCount?: number;
    
    blocks: ProgramBlock[] = [];
    startBlocks: ProgramBlock[] = [];
    endBlocks: ProgramBlock[] = [];
    
    constructor(pbrInstance: ProgramBlockRunner, obj: IProgramStep)
    {
        this.pbrInstance = pbrInstance;
        this.name = obj.name;
        this.isEnabled = ParameterBlockRegistry(this.pbrInstance, obj.isEnabled);
        this.duration = ParameterBlockRegistry(this.pbrInstance, obj.duration);

        if(obj.runAmount)
        {
            this.runAmount = ParameterBlockRegistry(this.pbrInstance, obj.runAmount);
            this.runCount = obj.runCount ?? 0;
            this.type = (this.runAmount.data() as number > 1 ? ProgramStepType.MULTIPLE : ProgramStepType.SINGLE);
        }

        //Adding io starting blocks
        for(const io of obj.startBlocks || [])
        {
            this.startBlocks.push(ProgramBlockRegistry(this.pbrInstance, io));
        }

        //Adding io ending blocks
        for(const io of obj.endBlocks || [])
        {
            this.endBlocks.push(ProgramBlockRegistry(this.pbrInstance, io));
        }

        //adding program blocks
        for(const block of obj.blocks || [])
        {
            this.blocks.push(ProgramBlockRegistry(this.pbrInstance, block));
        }
    }

    public async execute(): Promise<ProgramStepResult>
    {
        if(!this.isEnabled)
        {
            this.pbrInstance.machine.logger.warn(`PBS: Step ${this.name} is disabled`);
            return ProgramStepResult.END;
        }

        if(this.pbrInstance.status.mode == PBRMode.ENDED)
        {
            this.pbrInstance.machine.logger.warn(`PBS: Tried to execute step ${this.name} while cycle ended.`);
            return ProgramStepResult.FAILED;
        }

        this.pbrInstance.machine.logger.info(`PBS: Started step: ${this.name}.`);
        this.state = ProgramStepState.STARTED;

        this.startTime = Date.now();

        this.pbrInstance.machine.logger.info(`PBS: Executing io starter blocks.`);
        for(const io of this.startBlocks)
        {
            await io.execute();
        }

        this.pbrInstance.machine.logger.info(`PBS: Executing step main blocks.`);
        for(const b of this.blocks)
        {
            if(this.state !== ProgramStepState.STARTED)
            {
                this.pbrInstance.machine.logger.info(`PBS: Ended step: ${this.name}, with state ${ProgramStepResult.FAILED}`);
                return ProgramStepResult.FAILED;
            }
            
            await b.execute();
        }

        this.pbrInstance.machine.logger.info(`PBS: Executing io ending blocks.`);
        for(const io of this.endBlocks)
        {
            await io.execute();
        }

        //handling of multiple runned steps
        if(this.runAmount !== undefined && this.runCount !== undefined && this.runAmount.data() as number > 1)
        {
            this.runCount++;

            if(this.runCount && this.runAmount && (this.runCount == this.runAmount.data()))
            {
                this.state = ProgramStepState.COMPLETED;
                this.pbrInstance.machine.logger.info(`PBS: Ended step: ${this.name}, with state ${ProgramStepResult.END}`);
                this.endTime = Date.now();
                return ProgramStepResult.END;
            }
            else
            {
                this.state = ProgramStepState.PARTIAL;
                this.pbrInstance.machine.logger.info(`PBS: Ended step: ${this.name}, with state ${ProgramStepResult.PARTIAL}`);
                this.endTime = Date.now();
                return ProgramStepResult.PARTIAL;
            }   
        }
        else
        {
            this.state = ProgramStepState.COMPLETED;
            this.pbrInstance.machine.logger.info(`PBS: Ended step: ${this.name}, with state ${ProgramStepResult.END}`);
            this.endTime = Date.now();
            return ProgramStepResult.END;
        } 
    }

    public async executeLastIO()
    {
        this.pbrInstance.machine.logger.info(`PBS: Executing io ending blocks.`);
        for(const io of this.endBlocks)
        {
            await io.execute();
        }
    }

    public stop()
    {
        this.state = ProgramStepState.STOPPED;
    }

    get progress()
    {
        let progress = 0;
            switch(this.state)
            {
                case ProgramStepState.STARTED:
                {
                    if(this.startTime)
                    {
                        progress = parseFloat(((Date.now() - this.startTime) / ((this.duration.data() as number) * 1000)).toFixed(2));
                        progress = (progress >= 1 ? 1 : progress);
                        break;
                    }
                    else
                    {
                        progress = 0;
                        break;
                    }
                }
                case ProgramStepState.STOPPED:
                {
                    progress = 0;
                    break;
                }
                case ProgramStepState.COMPLETED || ProgramStepState.PARTIAL:
                {
                    progress = (this.type == ProgramStepType.SINGLE) ? 1 : 0;
                    break;
                }
                default: {
                    progress = 0;
                    break;
                }
            }
            if((this.type == ProgramStepType.MULTIPLE) && this.runAmount)
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