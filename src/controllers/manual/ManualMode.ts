import { IManualMode } from "../../interfaces/IManualMode";
import { IOController } from "../io/IOController";
import { ManualModeController } from "./ManualModeController";
import { ManualWatchdogCondition } from "./ManualModeWatchdog";

export class ManualMode implements IManualMode
{
    name: string;

    category: string;
    
    controls: ({name: string, analogScaleDependant: boolean} | string)[];

    incompatibility?: string[];
    requires?: string[];
    watchdog: ManualWatchdogCondition[];

    analogScale?: {min: number, max: number};

    public state = 0;

    locked: boolean;

    constructor(obj: IManualMode)
    {
        this.name = obj.name;

        this.category = (obj.name.split("#").length > 1) ? obj.name.split("#")[0] : "generic";
        
        this.incompatibility = obj.incompatibility ?? [];
        this.requires = obj.requires;

        this.controls = obj.controls;
        this.analogScale = obj.analogScale;

        this.watchdog = [];

        this.locked = false; // lock this manual mode if it is controlled by something else

        if(obj.watchdog !== undefined)
        {
            for(const w of obj.watchdog)
            {
                this.watchdog.push(new ManualWatchdogCondition(this, w));
            }
        }

        //Add io gates manual mode watchdog
        for(const io of IOController.getInstance().gates.filter(g => g.manualModeWatchdog == true))
        {
            this.watchdog.push(new ManualWatchdogCondition(this, {gateName: io.name, gateValue: 1}));
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
            //if this manual mode has incompatibilities
            if(this.incompatibility !== undefined)
            {
                //find if incompatibilities are enabled
                if(this.incompatibility.map(k => ManualModeController.getInstance().manualModes.find(j => j.name == k)).filter(k => (k?.state ?? 1) > 1).length > 0)
                {
                    return false;
                }
            }

            //if this manual mode has requires
            if(this.requires !== undefined)
            {
                //find if required manual modes are enabled
                if(this.requires.filter(r => ManualModeController.getInstance().manualModes.find(s => s.name == r)?.state == 0).length > 0)
                {
                    return false;
                }
            }

            //key is ready to be toggled
            //toggle gates but not if they are already active
            //unless this gate is analogdependant
            const activeGates = ManualModeController.getInstance().manualModes.filter(k => (k.state && k.analogScale === undefined)).flatMap(k => k.controls);
            const gatesToToggle = this.controls.filter(g => !activeGates.includes(g));

            for(const gate of gatesToToggle)
            {
                if(typeof gate == "string")
                    await IOController.getInstance().gFinder(gate)?.write(state);
                else
                    await IOController.getInstance().gFinder(gate.name)?.write((gate.analogScaleDependant === true) ? state : ((state > 0) ? 1 : 0));
            }

            this.watchdog.forEach(w => w.startTimer());

            this.state = state;

            return true;
        }
        else
        {
            const manualsModesWichRequires = ManualModeController.getInstance().manualModes.filter(m => m.requires?.includes(this.name) && m.state > 0);
            if(manualsModesWichRequires.length > 0)
            /**
             * TODO: Fix using popup controller
             this.machine.displayPopup({
                 identifier: "manual-mode-required-parent-toggle-off",
                 title: "popups.manualMode.requiredParent.title",
                 message: "popups.manualMode.requiredParent.message"
             });
             */

            //toggle off the manuals modes wich requires this one as a parent
            for(const manual of manualsModesWichRequires)
            {
                await manual.toggle(0);
            }

            //manual mode is going to be disabled, set concerned gates to false
            const activeGatesThatStay = ManualModeController.getInstance().manualModes.filter(k => (k.state > 0) && k.name !== this.name).flatMap(k => k.controls);
    
            const gatesToToggleOff = this.controls.filter(g => !activeGatesThatStay.includes(g));
    
            for(const gate of gatesToToggleOff)
            {
                if(typeof gate == "string")
                    await IOController.getInstance().gFinder(gate)?.write(0);
                else
                    await IOController.getInstance().gFinder(gate.name)?.write(0);
            }
    
            this.state = 0;
            this.watchdog.forEach(w => w.stopTimer());

            return true;
        }
    }

    lock()
    {
        this.locked = true;
    }
    unlock()
    {
        this.locked = false;
    }
    
    toJSON()
    {
        return {
            name: this.name,
            category: this.category,
            state: this.state,
            locked: this.locked,

            controls: this.controls,
            
            incompatibility: this.incompatibility,
            requires: this.requires,
            analogScale: this.analogScale,
        }
    } 
}