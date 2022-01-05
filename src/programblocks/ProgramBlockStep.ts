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
            this.type = (this.runAmount.data() as number > 1 ? ProgramStepType.MULTIPLE : ProgramStepType.SINGLE);
        }

        //Adding io starting blocks
        for(const io of obj.startingIO)
        {
            this.startingIO.push(ProgramBlockRegistry(this.pbrInstance, io));
        }

        console.log("starting", this.name, this.startingIO);

        //Adding io ending blocks
        for(const io of obj.endingIO)
        {
            this.endingIO.push(ProgramBlockRegistry(this.pbrInstance, io));
        }

        console.log("ending", this.name, this.endingIO);


        //adding program blocks
        for(const block of obj.blocks)
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
        if(this.runAmount && this.runAmount.data() as number > 1)
        {
            this.runCount = (this.runCount) ? this.runCount + 1 : 0;

            if(this.runCount && this.runAmount && (this.runCount == this.runAmount.data()))
            {
                this.state = ProgramStepState.COMPLETED;
                this.pbrInstance.machine.logger.info(`Ended step: ${this.name}, with state ${ProgramStepResult.END}`);
                return ProgramStepResult.END;
            }
            else
            {
                this.state = ProgramStepState.PARTIAL;
                this.pbrInstance.machine.logger.info(`Ended step: ${this.name}, with state ${ProgramStepResult.PARTIAL}`);
                return ProgramStepResult.PARTIAL;
            }   
        }
        else
        {
            this.state = ProgramStepState.COMPLETED;
            this.pbrInstance.machine.logger.info(`Ended step: ${this.name}, with state ${ProgramStepResult.END}`);
            return ProgramStepResult.END;
        } 
    }

    public stop()
    {
        this.state = ProgramStepState.STOPPED;
    }

    get progress()
    {
        if(this.startTime)
        {
            switch(this.state)
            {
                case ProgramStepState.STARTED:
                {
                    //TODO: Clean this mess
                    
                    if(this.type == ProgramStepType.MULTIPLE && this.runCount && this.runAmount)
                        return parseFloat((this.runCount / (this.runAmount.data() as number)).toFixed(2)) + parseFloat(((Date.now() - this.startTime) / (this.duration.data() as number)).toFixed(2)) * parseFloat((1 / (this.runAmount.data() as number)).toFixed(2));
                    else
                        return parseFloat(((Date.now() - this.startTime) / (this.duration.data() as number)).toFixed(2));
                }
                case ProgramStepState.STOPPED:
                {
                    if(this.duration !== undefined && this.startTime !== undefined && this.endTime !== undefined)
                        return parseFloat(((this.endTime - this.startTime) / (this.duration.data() as number)).toFixed(2));
                    else
                        return 0;
                }
                case ProgramStepState.COMPLETED: 
                {
                    return 1;
                }
                case ProgramStepState.PARTIAL:
                {
                    if(this.runAmount && this.runCount)
                        return parseFloat((this.runCount / (this.runAmount.data() as number)).toFixed(2));
                    else
                        throw new Error("RunAmount & runCount are not defined");
                }
                default: {
                    return 0;
                }
            }
        }
        else
            return 0; //progress cant be established because step has no starttime
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