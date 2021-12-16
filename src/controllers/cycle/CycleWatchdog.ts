import { Cycle, ICycle } from "./Cycle";

export class CycleWatchdog
{
    cycleInstance: Cycle;
    conditions: IWatchdogCondition[];

    private timer?: NodeJS.Timer;

    constructor(cycle: Cycle, conditions: IWatchdogCondition[])
    {
        this.cycleInstance = cycle;
        this.conditions = conditions;
    }

    performCheck(start: boolean = false): boolean
    {
        let final = false;

        for(let c of this.conditions)
        {
            if(start == false && c.startOnly)
                continue;

            c.result = (this.cycleInstance.ioExplorer?.explore(c.gateName)?.value != c.gateValue);

            if(!c.result)
                console.log(`Watchdog: ${c.gateName} state is not what it should be ${c.gateValue}`);

            final = final && c.result;

            
        }

        return final;
    }

    /**
     * Starts a periodic check of the watchdog
     */
    periodicCheck(start: boolean = false)
    {
        if(this.timer)
            clearInterval(this.timer);

        this.timer = setInterval(() => {
            let result = this.performCheck();
            if(result == false && start == false)
                this.cycleInstance.stop();

        }, 100);
    }
}

export interface IWatchdogCondition
{
    gateName: string;
    gateValue: number;
    startOnly: boolean;

    result: boolean;
}