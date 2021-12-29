import { CycleMode } from "../controllers/cycle/Cycle";
import { ProgramBlockRunner } from "./ProgramBlockRunner";

export class WatchdogCondition implements IWatchdogCondition
{
    private pbr: ProgramBlockRunner;
    gateName: string;
    gateValue: number;
    startOnly: boolean;
    result = false;

    timer?: NodeJS.Timer;
    
    constructor(pbr: ProgramBlockRunner, obj: IWatchdogCondition)
    {
        this.pbr = pbr;

        this.gateName = obj.gateName;
        this.gateValue = obj.gateValue;
        this.startOnly = obj.startOnly;
    }

    public startTimer()
    {
        this.timer = setInterval(() => {

            const tmp = this.pbr.ioExplorer?.explore(this.gateName)?.value == this.gateValue;

            //if this watchdog condition is only at startup
            //ignore its result
            this.result = (this.startOnly && this.pbr.status.mode != CycleMode.CREATED) ? true : tmp;

            if(process.env.NODE_ENV == "production")
                if(this.result == false && this.pbr.status.mode == CycleMode.STARTED)
                {
                    this.stopTimer();
                    this.pbr.event.emit("stop", ["watchdog-" + this.gateName]);
                }
        }, 250);
    }

    public stopTimer()
    {
        if(this.timer)
            clearInterval(this.timer);
    }
}

export interface IWatchdogCondition
{
    gateName: string;
    gateValue: number;
    startOnly: boolean;

    result: boolean;
}