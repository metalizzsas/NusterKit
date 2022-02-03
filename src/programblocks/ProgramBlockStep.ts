import { IParameterBlock, ParameterBlock, ParameterBlockRegistry } from "./ParameterBlocks";
import { PBRMode, ProgramBlockRunner } from "./ProgramBlockRunner";
import { IProgramBlock, ProgramBlock, ProgramBlockRegistry } from "./ProgramBlocks";

export class ProgramBlockStep implements IProgramStep
{
    private pbrInstance: ProgramBlockRunner;

    name: string;

    startingIO: ProgramBlock[] = [];
    endingIO: ProgramBlock[] = [];

    state: ProgramStepState = ProgramStepState.WAITING;
    type: ProgramStepType = ProgramStepType.SINGLE;

    isEnabled: ParameterBlock;
    duration: ParameterBlock;

    startTime?: number;
    endTime?: number;

    runAmount?: ParameterBlock;
    runCount?: number;
    
    blocks: ProgramBlock[] = [];

    constructor(pbrInstance: ProgramBlockRunner, obj: IProgramStep)
    {
        this.pbrInstance = pbrInstance;
        this.name = obj.name;
        this.isEnabled = ParameterBlockRegistry(this.pbrInstance, obj.isEnabled);
        this.duration = ParameterBlockRegistry(this.pbrInstance, obj.duration);

        if(obj.runAmount)
        {
            this.runAmount = ParameterBlockRegistry(this.pbrInstance, obj.runAmount);
            this.runCount = obj.runCount || 0;
            this.type = (this.runAmount.data() as number > 1 ? ProgramStepType.MULTIPLE : ProgramStepType.SINGLE);
        }

        //Adding io starting blocks
        for(const io of obj.startingIO || [])
        {
            this.startingIO.push(ProgramBlockRegistry(this.pbrInstance, io));
        }

        //Adding io ending blocks
        for(const io of obj.endingIO || [])
        {
            this.endingIO.push(ProgramBlockRegistry(this.pbrInstance, io));
        }

        //adding program blocks
        for(const block of obj.blocks || [])
        {
            this.blocks.push(ProgramBlockRegistry(this.pbrInstance, block));
        }
    }

    public async execute(): Promise<ProgramStepResult>
    {
        if(this.pbrInstance.status.mode == PBRMode.ENDED)
        {
            this.pbrInstance.machine.logger.warn(`Tried to execute step ${this.name} while cycle ended.`);
            return ProgramStepResult.FAILED;
        }

        this.pbrInstance.machine.logger.info(`Started step: ${this.name}.`);
        this.state = ProgramStepState.STARTED;

        this.startTime = Date.now();

        this.pbrInstance.machine.logger.info(`Executing io starter blocks.`);
        for(const io of this.startingIO)
        {
            await io.execute();
        }

        this.pbrInstance.machine.logger.info(`Executing step main blocks.`);
        for(const b of this.blocks)
        {
            if(this.state !== ProgramStepState.STARTED)
            {
                this.pbrInstance.machine.logger.info(`Ended step: ${this.name}, with state ${ProgramStepResult.FAILED}`);
                return ProgramStepResult.FAILED;
            }
            
            await b.execute();
        }

        this.pbrInstance.machine.logger.info(`Executing io ending blocks.`);
        for(const io of this.endingIO)
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
                this.pbrInstance.machine.logger.info(`Ended step: ${this.name}, with state ${ProgramStepResult.END}`);
                this.endTime = Date.now();
                return ProgramStepResult.END;
            }
            else
            {
                this.state = ProgramStepState.PARTIAL;
                this.pbrInstance.machine.logger.info(`Ended step: ${this.name}, with state ${ProgramStepResult.PARTIAL}`);
                this.endTime = Date.now();
                return ProgramStepResult.PARTIAL;
            }   
        }
        else
        {
            this.state = ProgramStepState.COMPLETED;
            this.pbrInstance.machine.logger.info(`Ended step: ${this.name}, with state ${ProgramStepResult.END}`);
            this.endTime = Date.now();
            return ProgramStepResult.END;
        } 
    }

    public async executeLastIO()
    {
        this.pbrInstance.machine.logger.info(`Executing io ending blocks.`);
        for(const io of this.endingIO)
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

            startingIO: this.startingIO,
            endingIO: this.endingIO,
            
            blocks: this.blocks
        }
    }
}

export interface IProgramStep
{
    name: string;

    state: ProgramStepState;
    type: ProgramStepType;
    
    isEnabled: IParameterBlock;
    duration: IParameterBlock;

    startTime?: number;
    endTime?: number;

    runAmount?: IParameterBlock;
    runCount?: number;

    startingIO: IProgramBlock[];
    endingIO: IProgramBlock[];

    blocks: IProgramBlock[]
}

export interface IProgramStepInformations
{
    isEnabled: boolean,

    type?: string,
    state?: string,

    duration?: number,
    startTime?: number,
    endTime?: number,

    runAmount?: number,
    runCount?: number
}

export interface IProgramStepIOStarter
{
    name: ParameterBlock;
    value: ParameterBlock;
}

export enum ProgramStepState
{
    WAITING = "waiting",
    STARTED = "started",
    PARTIAL = "partial",
    STOPPED = "stopped",
    COMPLETED = "completed",
    DISABLED = "disabled"
}

export enum ProgramStepType
{
    SINGLE = "single",
    MULTIPLE = "multiple"
}

export enum ProgramStepResult
{
    FAILED = "failed",
    PARTIAL = "partial",
    END = "end"
}