import { EventEmitter } from "stream";
import { CycleMode, ICycleStatus } from "../controllers/cycle/Cycle";
import { CycleStepResult, CycleStepState, CycleStepType } from "../controllers/cycle/CycleStep";
import { IOExplorer } from "../controllers/io/IOExplorer";
import { IProfile } from "../controllers/profile/Profile";
import { ProfileExplorer } from "../controllers/profile/ProfileExplorer";
import { Machine } from "../Machine";
import { IParameterBlock, ParameterBlock, ParameterBlockRegistry } from "./ParameterBlocks";
import { IProgramBlock, ProgramBlock, ProgramBlockRegistry } from "./ProgramBlocks";
import { IWatchdogCondition, WatchdogCondition } from "./Watchdog";

export class ProgramBlockRunner implements IProgram
{
    status: ICycleStatus;

    //identifiers vars
    name: string;
    profileIdentifier: string;
    
    //Inside definers
    steps: ProgramBlockStep[] = [];
    watchdogConditions: IWatchdogCondition[] = [];

    //internals
    currentStepIndex = 0;

    //statics
    machine: Machine;
    profile: IProfile;

    //explorers
    profileExplorer?: ProfileExplorer;
    ioExplorer?: IOExplorer;

    //event
    event: EventEmitter;
    
    constructor(machine: Machine, profile: IProfile, object: IProgram)
    {
        this.status = { mode: CycleMode.CREATED };

        this.machine = machine;
        this.profile = profile;

        //properties assignment
        this.profileIdentifier = object.profileIdentifier;
        this.name = object.name;

        //Explorers setup
        this.profileExplorer = new ProfileExplorer(this.profile);
        this.ioExplorer = new IOExplorer(machine.ioController!);

        //steps and watchdog
        for(let watchdog of object.watchdogConditions)
        {
            this.watchdogConditions.push(new WatchdogCondition(this, watchdog));
        }
        for(let step of object.steps)
        {
            this.steps.push(new ProgramBlockStep(this, step));
        }

        this.event = new EventEmitter();

        this.event.on("end", this.end);
        this.event.on("stop", this.stop);
    }

    public async run()
    {
        console.log(this.steps);

        console.log("Cycle start");
        this.status.mode = CycleMode.STARTED;

        while(this.currentStepIndex < this.steps.length)
        {
            let result = await this.steps[this.currentStepIndex].execute();

            console.log(this.steps[this.currentStepIndex].name, result);

            switch(result)
            {
                case CycleStepResult.FAILED:
                {
                    await this.stop();
                    return false;
                }
                case CycleStepResult.PARTIAL:
                {

                    //reset times at the end of a partial step
                    this.steps[this.currentStepIndex].resetTimes();

                    //if next step does not exists or next step is not a multiple step,
                    //return to first multiple step
                    if(this.steps[this.currentStepIndex + 1].type != CycleStepType.MULTIPLE)
                    {

                        let j = this.steps.findIndex((step) => step.type == CycleStepType.MULTIPLE)

                        console.log("first found multiple task index", j);

                        if(j > -1)
                            this.currentStepIndex = j;
                        else 
                            throw new Error("Failed to find first Multiple task");
                        continue;
                    }
                }
            }
            this.currentStepIndex++;
        }
        this.end();

        return true;
    }

    public end(reason?: string)
    {
        this.status.endReason = reason || "cycle-ended";
        this.status.mode = CycleMode.ENDED;
        //TODO: Resorbs all timers and everything
    }

    public async stop()
    {
        this.status.mode = CycleMode.WAITING_STOP;
        await this.steps[this.currentStepIndex].stop();
        this.status.mode = CycleMode.STOPPED;

        this.end("cycle-stopped");
    }

    public get progress()
    {
        let duration = 0;

        for(let step of this.steps)
        {
            duration += step.progress;
        }

        return duration / this.steps.length;
    }

    toJSON()
    {
        return {
            status: this.status,
            steps: this.steps
        }
    }
}

export class ProgramBlockStep implements IProgramStep
{
    pbrInstance: ProgramBlockRunner;

    name: string;

    state: CycleStepState = CycleStepState.WAITING;
    type: CycleStepType = CycleStepType.SINGLE;

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
            this.type = (this.runAmount.data() > 1 ? CycleStepType.MULTIPLE : CycleStepType.SINGLE);
        }
            

        for(let block of obj.blocks)
        {
            this.blocks.push(ProgramBlockRegistry(this.pbrInstance, block));
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

    get progress()
    {
        switch(this.state)
        {
            case CycleStepState.STARTED:
            {
                if(this.type == CycleStepType.MULTIPLE)
                    return parseFloat((this.runCount! / this.runAmount?.data()!).toFixed(2)) + parseFloat(((Date.now() - this.startTime!) / this.duration.data()!).toFixed(2)) * parseFloat((1 / this.runAmount?.data()!).toFixed(2));
                else
                    return parseFloat(((Date.now() - this.startTime!) / this.duration.data()!).toFixed(2));
            }
            case CycleStepState.STOPPED:
            {
                if(this.duration !== undefined && this.startTime !== undefined && this.endTime !== undefined)
                    return parseFloat(((this.endTime - this.startTime) / this.duration.data()).toFixed(2));
                else
                    return 0;
            }
            case CycleStepState.ENDED: 
            {
                return 1;
            }
            case CycleStepState.PARTIAL:
            {
                return parseFloat((this.runCount! / this.runAmount?.data()!).toFixed(2));
            }
            default: {
                return 0;
            }
        }
    }
    public resetTimes()
    {
        this.startTime = undefined;
        this.endTime = undefined;
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
    steps: IProgramStep[];
    watchdogConditions: IWatchdogCondition[];
}