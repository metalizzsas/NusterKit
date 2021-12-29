import { CycleMode } from "../controllers/cycle/Cycle";
import { ProgramBlockRunner } from "./ProgramBlockRunner";

export class WatchdogCondition implements IWatchdogCondition
{
    private pbr: ProgramBlockRunner;
    gateName: string;
    gateValue: number;
    startOnly: boolean;
    result = false;

    canStartLog = false;
    cantStartLog = false;

    timer?: NodeJS.Timer;
    
    constructor(pbr: ProgramBlockRunner, obj: IWatchdogCondition)
    {
        this.pbr = pbr;

        this.gateName = obj.gateName;
        this.gateValue = obj.gateValue;
        this.startOnly = obj.startOnly;

        this.startTimer();
    }

    public startTimer()
    {
        this.timer = setInterval(() => {

            //remove the timer if this condition is only active at startup
            if(this.startOnly && this.pbr.status.mode == CycleMode.STARTED)
            {
                this.stopTimer();
                return;
            }

            const tmp = this.pbr.ioExplorer?.explore(this.gateName)?.value == this.gateValue;

            //if this watchdog condition is only at startup
            //ignore its result
            this.result = (this.startOnly && this.pbr.status.mode != CycleMode.CREATED) ? true : tmp;

            if(process.env.NODE_ENV == "production")
            {
                if(this.result && !this.canStartLog)
                {
                    this.pbr.machine.logger.info(`Watchdog condition: ${this.gateName} = ${this.gateValue} is now ok to start.`);
                    
                    this.canStartLog = true;
                    this.cantStartLog = false;
                }
                
                if(this.result == false)
                {
                    if(this.pbr.status.mode == CycleMode.CREATED)
                    {
                        if(!this.cantStartLog)
                        {
                            this.pbr.machine.logger.warn(`Watchdog condition: ${this.gateName} = ${this.gateValue} is not ok to start.`);

                            this.cantStartLog = true;
                            this.canStartLog = false;
                        }
                    }
                    else
                    {
                        this.pbr.machine.logger.warn(`Watchdog condition failed: ${this.gateName} = ${this.gateValue}`);
                        this.pbr.event.emit("end", ["watchdog-" + this.gateName]);
                        this.stopTimer();
                    }
                }
            }
        }, 250);
    }

    public stopTimer()
    {
        if(this.timer)
            clearInterval(this.timer);
    }

    toJSON()
    {
        return{
            gateName: this.gateName,
            gateValue: this.gateValue,
            startOnly: this.startOnly,
            result: this.result
        }
    }
}

export interface IWatchdogCondition
{
    gateName: string;
    gateValue: number;
    startOnly: boolean;

    result: boolean;
}