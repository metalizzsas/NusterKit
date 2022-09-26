import { IManualWatchdogCondition } from "../../interfaces/IManualMode";
import { Machine } from "../../Machine";
import { ManualMode } from "./ManualMode";

export class ManualWatchdogCondition implements IManualWatchdogCondition
{
    gateName: string;
    gateValue: number;
    result: boolean;

    timer?: NodeJS.Timer;

    private machine: Machine;
    private manual: ManualMode;
    
    constructor(manual: ManualMode, obj: IManualWatchdogCondition, machine: Machine)
    {
        this.gateName = obj.gateName;
        this.gateValue = obj.gateValue;

        this.machine = machine;
        this.manual = manual;
        
        this.result = false;
    }

    public startTimer()
    {
        this.timer = setInterval(() => {

            this.result = ((this.machine.ioController.gFinder(this.gateName)?.value || 0) === this.gateValue);
            if(this.result == false)
            {
                if(this.manual.state > 0 && process.env.NODE_ENV == "production")
                {
                    this.machine.logger.warn("Manual watchdog condition failed, toggling manual mode off.");

                    this.machine.displayPopup({
                        identifier: "manual-mode-watchdog-error",
                        title: "popups.manualMode.security.title",
                        message: "popups.manualMode.security.message"
                    });

                    this.manual.toggle(0);
                    this.stopTimer();
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
            result: this.result
        }
    }
}