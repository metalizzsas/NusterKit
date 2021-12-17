import { CycleMode } from "../controllers/cycle/Cycle";
import { ProgramBlockRunner } from "./ProgramBlockRunner";

export class WatchdogCondition implements IWatchdogCondition
{
    gateName: string;
    gateValue: number;
    startOnly: boolean;
    result: boolean = false;
    
    constructor(cycle: ProgramBlockRunner, obj: IWatchdogCondition)
    {
        this.gateName = obj.gateName;
        this.gateValue = obj.gateValue;
        this.startOnly = obj.startOnly;

        setInterval(() => {

            let tmp = cycle.ioExplorer?.explore(this.gateName)?.value == this.gateValue;

            //if this watchdog condition is only at startup
            //ignore its result
            this.result = (this.startOnly && cycle.status.mode != CycleMode.CREATED) ? true : tmp;

            if(this.result == false && cycle.status.mode == CycleMode.STARTED)
                cycle.event.emit("stop", ["watchdog-" + this.gateName]);
           
        }, 250);
    }
}

export interface IWatchdogCondition
{
    gateName: string;
    gateValue: number;
    startOnly: boolean;

    result: boolean;
}