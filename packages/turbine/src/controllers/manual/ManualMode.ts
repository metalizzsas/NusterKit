import type { IManualHydrated } from "@metalizzsas/nuster-typings/build/hydrated/manual";
import type { IConfigManualMode, IManualControl } from "@metalizzsas/nuster-typings/build/spec/manual";
import { WebsocketDispatcher } from "../../websocket/WebsocketDispatcher";
import { IOController } from "../io/IOController";
import { ManualModeController } from "./ManualModeController";
import { ManualWatchdogCondition } from "./ManualModeWatchdog";

export class ManualMode implements IConfigManualMode
{
    name: string;
    unity?: string;

    category: string;
    
    controls: (IManualControl | string)[];

    incompatibility?: string[];
    requires?: string[];
    watchdog: ManualWatchdogCondition[];

    analogScale?: {min: number, max: number};

    public state = 0;

    locked: boolean;

    constructor(obj: IConfigManualMode)
    {
        this.name = obj.name;

        this.unity = obj.unity ?? IOController.getInstance().gFinder((obj.controls[0] as IManualControl).name ?? obj.controls[0])?.unity ?? '%'

        this.category = (obj.name.split("#").length > 1) ? obj.name.split("#")[0] : "generic";
        
        this.incompatibility = obj.incompatibility ?? [];
        this.requires = obj.requires;

        this.controls = obj.controls;
        this.analogScale = obj.analogScale;

        this.watchdog = [];

        this.locked = false; // lock this manual mode if it is controlled by something else

        if(obj.watchdog !== undefined)
        {
            if(IOController.getInstance().gFinder("emergency-stop") !== undefined)
            {
                this.watchdog.push(new ManualWatchdogCondition(this, {
                    "gateName": "emergency-stop",
                    "gateValue": 1
                }));
            }

            for(const w of obj.watchdog)
            {
                this.watchdog.push(new ManualWatchdogCondition(this, w));
            }
        }
    }

    /**
     * Toggle the manual mode from value
     * @param value value to be set
     * @returns boolean if state of manual mode has changed
     */
    public async setValue(value: number): Promise<boolean>
    {
        let toggleOn = false;

        // if this manual mode has an analogScale
        if(this.analogScale)
        {
            if(value <= this.analogScale.max  && value >= this.analogScale.min)
                toggleOn = (value != 0);
            else
                return false;
        }
        else
        {
            //prevent value overflowing
            if(value != 0)
                value = 1;

            toggleOn = (value == 1);
        }

        //this manual mode have to be toggled on
        if(toggleOn)
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
                    await IOController.getInstance().gFinder(gate)?.write(value);
                else
                {
                    const valueToBeWritten = (gate.analogScaleDependant === true) ? 
                        ((gate.isValueAbsolute === true) ? 
                            Math.abs(value) : 
                            value
                        ) : 
                        ((gate.triggerWhenNegative ? value < 0 : value > 0) ? 
                            1 : 
                            0
                        );

                    await IOController.getInstance().gFinder(gate.name)?.write(valueToBeWritten);
                }
            }

            this.watchdog.forEach(w => w.startTimer());

            this.state = value;

            return true;
        }
        else
        {
            const manualsModesWichRequires = ManualModeController.getInstance().manualModes.filter(m => m.requires?.includes(this.name) && m.state > 0);
            if(manualsModesWichRequires.length > 0)

            // Toggle warning popup to screens
            WebsocketDispatcher.getInstance().togglePopup({
                title: "popups.manualMode.requiredParent.title",
                message: "popups.manualMode.requiredParent.message"
            });

            //toggle off the manuals modes wich requires this one as a parent
            for(const manual of manualsModesWichRequires)
            {
                await manual.setValue(0);
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
    
    toJSON(): IManualHydrated
    {
        return {
            name: this.name,
            unity: this.unity,
            category: this.category,
            state: this.state,
            locked: this.locked,
            
            incompatibility: this.incompatibility,
            requires: this.requires,
            analogScale: this.analogScale,
        }
    } 
}