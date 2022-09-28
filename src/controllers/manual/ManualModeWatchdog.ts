import { LoggerInstance } from "../../app";
import { IManualWatchdogCondition } from "../../interfaces/IManualMode";
import { IOController } from "../io/IOController";
import { ManualMode } from "./ManualMode";

export class ManualWatchdogCondition implements IManualWatchdogCondition
{
    gateName: string;
    gateValue: number;
    result: boolean;

    timer?: NodeJS.Timer;

    private manual: ManualMode;
    
    constructor(manual: ManualMode, obj: IManualWatchdogCondition)
    {
        this.gateName = obj.gateName;
        this.gateValue = obj.gateValue;

        this.manual = manual;
        
        this.result = false;
    }

    public startTimer()
    {
        this.timer = setInterval(() => {

            this.result = ((IOController.getInstance().gFinder(this.gateName)?.value || 0) === this.gateValue);
            if(this.result == false)
            {
                if(this.manual.state > 0 && process.env.NODE_ENV == "production")
                {
                    LoggerInstance.warn("Manual watchdog condition failed, toggling manual mode off.");

                    /*
                    TODO: Fix display popup (maybe using a controller for this stuff)
                    this.machine.displayPopup({
                        identifier: "manual-mode-watchdog-error",
                        title: "popups.manualMode.security.title",
                        message: "popups.manualMode.security.message"
                    }); 
                    */
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