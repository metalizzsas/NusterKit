import { IProfile } from "../models/Profile";
import { CycleStep, CycleStepResult, CycleStepState, CycleStepType } from "./CycleStep";

export class Cycle
{
    public status: ICycleStatus;

    public profile: IProfile;

    public currentStepIndex: number = 0;

    public steps: CycleStep[] = []

    constructor(profile: IProfile)
    {
        this.status = { mode: CycleMode.CREATED };
        this.profile = profile;
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

    private progress()
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


interface ICycleStatus
{
    mode: CycleMode,
    
    startDate?: number,
    endDate?: number,
    endReason?: string

    progress?: number
}

/**
 * This defines all the cycle modes
 */
enum CycleMode
{
    CREATED = "created",
    STARTED = "started",
    PAUSED = "paused",
    WAITING_PAUSE = "waiting-for-pause",
    STOPPED = "stopped",
    WAITING_STOP = "waiting-for-stop",
    ENDED = "ended"
}