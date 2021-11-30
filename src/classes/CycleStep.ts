import { Cycle } from "./Cycle";

export class CycleStep
{
    private parentCycle: Cycle;

    public status: CycleStepInformations

    public name: string;

    private runner: Function;

    constructor(cycle: Cycle, name: string, informations: ICycleStepInformations, runner: Function)
    {
        this.parentCycle = cycle;
        
        this.name = name;

        this.status = new CycleStepInformations(informations.isEnabled, informations.duration, informations.runAmount);

        this.runner = runner;
        
    }

    public async run(): Promise<CycleStepResult>
    {
        //Check status if runcount is not over the limit
        if(this.status.start())
        {
            console.log("Step", this.name, "has started");
            this.status.state = CycleStepState.STARTED;

            await this.runner();

            if(this.status.type == CycleStepType.MULTIPLE)
            {
                this.status.runCount != undefined ? this.status.runCount++ : this.status.runCount = 1;

                if(this.status.runCount != this.status.runAmount)
                {
                    this.status.state = CycleStepState.PARTIAL;
                    console.log("Step", this.name, "has been partialy finished");
                    return CycleStepResult.PARTIAL;
                }   
            }

            this.status.state = CycleStepState.ENDED;
            console.log("Step", this.name, "has ended")
            return CycleStepResult.END;         
        }
        else
        {
            return CycleStepResult.FAILED;
        }
    }

    public async stop()
    {
        this.status.state == CycleStepState.STOPPED;
    }

    get progress()
    {
        return 0;
    }

    toJSON()
    {
        return {
            name: this.name,
            status: this.status,
        }
    }
}

interface ICycleStepInformations
{
    isEnabled: boolean,

    duration?: number,
    runAmount?: number,
}

export enum CycleStepType
{
    SINGLE = "single",
    MULTIPLE = "multiple"
}

export enum CycleStepResult
{
    FAILED = "failed",
    PARTIAL = "partial",
    END = "end"
}

class CycleStepInformations
{
    public isEnabled: boolean;
    public type: CycleStepType = CycleStepType.SINGLE;
    
    public state: CycleStepState = CycleStepState.WAITING;

    private duration?: number;
    private startTime?: number;
    private endTime?: number;

    public runAmount?: number;
    public runCount?: number;

    constructor(isEnabled: boolean, duration?: number, runAmount?: number)
    {
        this.isEnabled = isEnabled;

        if(!isEnabled)
            this.state = CycleStepState.DISABLED;

        this.duration = duration;
        
        //set type to multiple if runAmount is superior than 1
        this.type = (runAmount !== undefined && runAmount > 1) ? CycleStepType.MULTIPLE : CycleStepType.SINGLE;

        this.runAmount = runAmount;

        if(this.runAmount != undefined)
            this.runCount = 0;
    }

    /**
     * Checking if this step has a run counter , if it does check that it does not exceed run count
     * @returns {Boolean}
     */
    start():boolean
    {
        this.startTime = Date.now();

        if(this.runAmount !== undefined && this.runCount !== undefined)
        {
            return !(this.runCount >= this.runAmount);
        }
        else
        {
            return true;
        }
    }

    public resetTimes()
    {
        this.startTime = undefined;
        this.endTime = undefined;
    }

    /**
     * Get progress from step informations
     * Caculations are based on startTime, endTime, duration & state of the step
     */
    get progress() :number
    {

        switch(this.state)
        {
            case CycleStepState.STARTED:
            {
                if(this.type == CycleStepType.MULTIPLE)
                    return parseFloat((this.runCount! / this.runAmount!).toFixed(2)) + parseFloat(((Date.now() - this.startTime!) / this.duration!).toFixed(2)) * parseFloat((1 / this.runAmount!).toFixed(2));
                else
                    return parseFloat(((Date.now() - this.startTime!) / this.duration!).toFixed(2));
            }
            case CycleStepState.STOPPED:
            {
                if(this.duration !== undefined && this.startTime !== undefined && this.endTime !== undefined)
                    return parseFloat(((this.endTime - this.startTime) / this.duration).toFixed(2));
                else
                    return 0;
            }
            case CycleStepState.ENDED: 
            {
                return 1;
            }
            case CycleStepState.PARTIAL:
            {
                return parseFloat((this.runCount! / this.runAmount!).toFixed(2));
            }
            default: {
                return 0;
            }
        }
    }

    toJSON()
    {
        return {
            isEnabled: this.isEnabled,

            state: this.state,
            progress: this.progress,

            runAmout: this.runAmount,
            runCount: this.runCount
        }
    }

}
/**
 * CycleStepState 
 */
export enum CycleStepState
{
    WAITING = "waiting",
    STARTED = "started",
    PARTIAL = "partial",
    STOPPED = "stopped",
    ENDED = "ended",
    DISABLED = "disabled"
}