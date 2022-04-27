import { IManualMode } from "../../interfaces/IManualMode";
import { Machine } from "../../Machine";
import { ManualWatchdogCondition } from "./ManualModeWatchdog";

export class ManualMode implements IManualMode
{
    name: string;
    controls: {name: string, analogScaleDependant: boolean}[];
    incompatibility: string[];
    watchdog: ManualWatchdogCondition[] = [];
    analogScale?: {min: number, max: number};

    machine: Machine;

    public state = 0;

    constructor(obj: IManualMode, machine: Machine)
    {
        this.name = obj.name;
        this.controls = obj.controls;
        this.incompatibility = obj.incompatibility;
        this.analogScale = obj.analogScale;

        this.machine = machine;

        for(const w of obj.watchdog ?? [])
        {
            this.watchdog.push(new ManualWatchdogCondition(this, w, this.machine));
        }

        for(const io of this.machine.ioController.gates.filter(g => g.manualModeWatchdog == true))
        {
            this.watchdog.push(new ManualWatchdogCondition(this, {gateName: io.name, gateValue: 1}, this.machine));
        }
    }

    public async toggle(state: number): Promise<boolean>
    {
        let trigger = false;

        if(this.analogScale)
        {
            if(state <= this.analogScale.max  && state >= this.analogScale.min)
            {
                if(state > this.analogScale.min)
                    trigger = true;
                else if(state == this.analogScale.max)
                    trigger = false;
            }
        }
        else
        {
            if(state > 1)
                state = 1;

            trigger = state == 1 ? true : false;
        }

        if(trigger)
        {
            if(
                this.incompatibility.filter(k => {
                k.startsWith("+") ? 
                    this.machine.manualmodeController.keys.filter(j => j.name == k.slice(0, 1) && j.state == 0 ) : 
                    this.machine.manualmodeController.keys.filter(j => j.name == k && j.state > 1)
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
                    await this.machine.ioController.gFinder(gate.name)?.write(this.machine.ioController, (gate.analogScaleDependant === true) ? state : ((state > 0) ? 1 : 0));
                }

                this.watchdog.forEach(w => w.startTimer());

                this.state = state;

                return true;
            }
        }
        else
        {
            //manual mode is going to be disabled, set concerned gates to false
            const activeGatesThatStay = this.machine.manualmodeController.keys.filter(k => (k.state > 0) && k.name !== this.name).flatMap(k => k.controls);
    
            const gatesToToggleOff = this.controls.filter(g => !activeGatesThatStay.includes(g));
    
            for(const gate of gatesToToggleOff)
            {
                if(typeof gate == "string")
                    await this.machine.ioController.gFinder(gate)?.write(this.machine.ioController, 0);
                else
                    await this.machine.ioController.gFinder(gate.name)?.write(this.machine.ioController, 0);
            }
    
            this.state = 0;
            this.watchdog.forEach(w => w.stopTimer());

            return true;
        }
    }
    toJSON()
    {
        return {
            name: this.name,
            controls: this.controls,
            incompatibility: this.incompatibility,
            state: this.state,
            analogScale: this.analogScale,
        }
    } 
}