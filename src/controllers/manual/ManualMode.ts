import { IManualMode } from "../../interfaces/IManualMode";
import { Machine } from "../../Machine";
import { ManualWatchdogCondition } from "./ManualModeWatchdog";

export class ManualMode implements IManualMode
{
    name: string;
    controls: string[];
    incompatibility: string[];
    watchdog: ManualWatchdogCondition[] = [];

    machine: Machine;

    public state = false;

    constructor(obj: IManualMode, machine: Machine)
    {
        this.name = obj.name;
        this.controls = obj.controls;
        this.incompatibility = obj.incompatibility;

        this.machine = machine;

        for(const w of obj.watchdog ?? [])
        {
            this.watchdog.push(new ManualWatchdogCondition(this, w, this.machine));
        }
    }

    public async toggle(state: boolean): Promise<boolean>
    {
        if(state === true)
        {
            if(
                this.incompatibility.filter(k => {
                k.startsWith("+") ? 
                    this.machine.manualmodeController.keys.filter(j => j.name == k.slice(0, 1) && j.state == false) : 
                    this.machine.manualmodeController.keys.filter(j => j.name == k && j.state == true)
            }).length > 0
            )
            {
                return false;
            }
            else
            {
                //key is ready to be toggled
                //toggle gates but not if they are already active

                const activeGates = this.machine.manualmodeController.keys.filter(k => k.state).flatMap(k => k.controls);

                const gatesToToggle = this.controls.filter(g => !activeGates.includes(g));

                for(const gate of gatesToToggle)
                {
                    await this.machine.ioController.gFinder(gate)?.write(this.machine.ioController, 1);
                }

                this.watchdog.forEach(w => w.startTimer());

                this.state = true;

                return true;
            }
        }
        else
        {
            //manual mode is going to be disabled, set concerned gates to false
            const activeGatesThatStay = this.machine.manualmodeController.keys.filter(k => k.state && k.name !== this.name).flatMap(k => k.controls);
    
            const gatesToToggleOff = this.controls.filter(g => !activeGatesThatStay.includes(g));
    
            for(const gate of gatesToToggleOff)
                await this.machine.ioController.gFinder(gate)?.write(this.machine.ioController, 0);
    
            this.state = false;
            this.watchdog.forEach(w => w.stopTimer());

            return true;
        }
    }
    toJson()
    {
        return {
            name: this.name,
            controls: this.controls,
            incompatibility: this.incompatibility,
            state: this.state
        }
    } 
}