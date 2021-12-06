import { Machine } from "../../Machine";
import { BlockProgramInterpreter } from "../../programblocks/Program";
import { IOExplorer } from "../io/IOExplorer";
import { IProfile } from "../profile/Profile";
import { ProfileExplorer } from "../profile/ProfileExplorer";
import { CycleStep, CycleStepResult, CycleStepState, CycleStepType, ICycleStep } from "./CycleStep";

export class Cycle implements ICycle
{
    public status: ICycleStatus;

    public machine: Machine;
    public name: string;
    public profile: IProfile;

    public profileExplorer?: ProfileExplorer;
    public ioExplorer?: IOExplorer;

    public currentStepIndex: number = 0;

    public steps: CycleStep[] = [];

    public programBlockInterpreter: BlockProgramInterpreter

    constructor(machine: Machine, name: string, profile: IProfile)
    {
        this.status = { mode: CycleMode.CREATED };
        this.machine = machine;
        this.profile = profile;
        this.name = name;

        this.profileExplorer = new ProfileExplorer(this.profile);

        this.ioExplorer = new IOExplorer(this.machine.ioController!);

        //create steps based of configuration file.

        this.programBlockInterpreter = new BlockProgramInterpreter(this, this.name, this.machine);

        this.programBlockInterpreter.start();

    }

    public async run(): Promise<boolean>
    {
        console.log(this.steps);

        console.log("Cycle start");
        this.status.mode = CycleMode.STARTED;

        while(this.currentStepIndex < this.steps.length)
        {
            let result = await this.steps[this.currentStepIndex].run();

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
                    this.steps[this.currentStepIndex].status.resetTimes();

                    //if next step does not exists or next step is not a multiple step,
                    //return to first multiple step
                    if(this.steps[this.currentStepIndex + 1].status.type != CycleStepType.MULTIPLE)
                    {

                        let j = this.steps.findIndex((step) => step.status.type == CycleStepType.MULTIPLE)

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
        this.status.endReason = reason || "cycle-ended";
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

    public progress()
    {
        let duration = 0;

        for(let step of this.steps)
        {
            duration += step.status.progress;
        }

        return duration / this.steps.length;
    }

    toJSON()
    {
        this.status.progress = this.progress()

        return {
            status: this.status,
            steps: this.steps,
        }
    }
}

export interface ICycle
{
    machine: Machine;
    name: string;

    profileExplorer?: ProfileExplorer;
    ioExplorer?: IOExplorer;

    currentStepIndex: number;

    programBlockInterpreter: BlockProgramInterpreter

    status: ICycleStatus,
    profile: IProfile,
    steps: ICycleStep[]

    run(): Promise<boolean>
    end(reason?: string): void
    stop(): void
    progress(): number
    toJSON(): Object
}

export interface ICycleStatus
{
    mode: CycleMode,
    
    startDate?: number,
    endDate?: number,
    endReason?: string,

    progress?: number
}

/**
 * This defines all the cycle modes
 */
export enum CycleMode
{
    CREATED = "created",
    STARTED = "started",
    PAUSED = "paused",
    WAITING_PAUSE = "waiting-for-pause",
    STOPPED = "stopped",
    WAITING_STOP = "waiting-for-stop",
    ENDED = "ended"
}