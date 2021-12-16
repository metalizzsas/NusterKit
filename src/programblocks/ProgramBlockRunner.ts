import { Cycle, ICycleStatus } from "../controllers/cycle/Cycle";
import { CycleStep, CycleStepResult, CycleStepState } from "../controllers/cycle/CycleStep";
import { IWatchdogCondition } from "../controllers/cycle/CycleWatchdog";
import { IParameterBlock, ParameterBlock, ParameterBlockRegistry } from "./ParameterBlocks";
import { ForLoopProgramBlock, IfProgramBlock, IOWriteProgramBlock, IProgramBlock, ProgramBlock, ProgramBlockRegistry, SleepProgramBlock } from "./ProgramBlocks";

export class ProgramBlockRunner implements IProgram
{
    profileIdentifier: string;
    name: string;
    cycle: Cycle;
    steps: ProgramBlockStep[] = [];

    constructor(cycleInstance: Cycle, object: IProgram)
    {
        this.profileIdentifier = object.profileIdentifier;
        this.cycle = cycleInstance;
        this.name = object.name;

        for(let step of object.steps)
        {
            this.steps.push(new ProgramBlockStep(this.cycle, step));
        }
    }
}

export class ProgramBlockStep implements IProgramStep
{
    cycle: Cycle;

    name: string;

    state: CycleStepState = CycleStepState.WAITING;

    isEnabled: ParameterBlock;
    duration: ParameterBlock;

    startTime?: number;
    endTime?: number;

    runAmount?: ParameterBlock;
    runCount?: number;
    
    blocks: ProgramBlock[] = [];

    constructor(cycleInstance: Cycle, obj: IProgramStep)
    {
        this.cycle = cycleInstance;
        this.name = obj.name;
        this.isEnabled = ParameterBlockRegistry(this.cycle, obj.isEnabled);
        this.duration = ParameterBlockRegistry(this.cycle, obj.duration);

        if(obj.runAmount)
            this.runAmount = ParameterBlockRegistry(this.cycle, obj.runAmount);

        for(let block of obj.blocks)
        {
            this.blocks.push(ProgramBlockRegistry(this.cycle, block));
        }
    }

    public async execute(): Promise<CycleStepResult>
    {
        this.state = CycleStepState.STARTED;

        for(let b of this.blocks)
        {
            if(this.state !== CycleStepState.STARTED)
                return CycleStepResult.FAILED;
            
            await b.execute();
        }

        //handling of multiple runned steps
        if(this.runAmount && this.runAmount.data() > 1)
        {
            this.runCount = (this.runCount) ? this.runCount + 1 : 0;

            if(this.runCount! == this.runAmount.data()!)
            {
                this.state = CycleStepState.ENDED;
                return CycleStepResult.END;
            }
            else
            {
                this.state = CycleStepState.PARTIAL;
                return CycleStepResult.PARTIAL;
            }   
        }
        else
        {
            this.state = CycleStepState.ENDED;
            return CycleStepResult.END;
        }  
    }

    public stop()
    {
        this.state = CycleStepState.STOPPED;
    }
}

interface IProgramStep
{
    name: string;
    
    isEnabled: IParameterBlock;
    duration: IParameterBlock;

    runAmount?: IParameterBlock;

    blocks: IProgramBlock[]
}

export interface IProgram
{
    name: string;
    profileIdentifier: string;
    cycle: Cycle;
    steps: IProgramStep[];
}