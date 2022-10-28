import type { ISlotSensor } from "@metalizzsas/nuster-typings/build/spec/slot";
import type { ESlotSensorType } from "@metalizzsas/nuster-typings/build/spec/slot";
import type { Slot } from "./Slot";
import type { IRegulation } from "@metalizzsas/nuster-typings/build/spec/slot/regulation";

import { IOController } from "../io/IOController";
import { LoggerInstance } from "../../app";
import { ManualModeController } from "../manual/ManualModeController";
import type { IRegulationHydrated, IRegulationStoredData } from "@metalizzsas/nuster-typings/build/hydrated/slot/regulation";
import type { ISlotSensorHydrated } from "@metalizzsas/nuster-typings/build/hydrated/slot";

const MAXLOGPOINTS = 50; // 12.5 last minutes

export class SlotSensor implements ISlotSensor
{
    io: string;
    type: ESlotSensorType;

    regulationEnabled?: boolean;
    regulationTarget?: number;
    regulationLogPoints?: IRegulationStoredData[];
    regulation?: IRegulation;

    /** Reference to parent slot */
    private parentSlot: Slot;

    constructor(slot: Slot, slotsensor: ISlotSensor)
    {
        this.io = slotsensor.io;
        this.type = slotsensor.type;

        this.regulation = slotsensor.regulation;

        this.parentSlot = slot;

        //if this slot has regulation, start up
        if(this.regulation !== undefined)
        {
            this.regulationEnabled = false;
            this.regulationTarget = this.value; //sets the target as the default iogate value
            this.regulationLogPoints = new Array<IRegulationStoredData>();
            this.regulationLoop();
        }
    }

    /** This might get replaced by [#36](https://github.com/metalizzsas/NusterKit/issues/36) */
    get value(): number
    {
        const sensorValue = IOController.getInstance().gFinder(this.io)?.value ?? 0;

        //unload slot on minimal sensor limit reached
        if(this.type === "level-min-n" && sensorValue == 0)
            this.parentSlot.unloadSlot();
        
        return sensorValue;
    }

    /** 
     * Start the regulation loop.
     * Will be replaced by [#36](https://github.com/metalizzsas/NusterKit/issues/36)
     * */
    private regulationLoop()
    {
        if(this.regulationEnabled == true && this.regulationTarget !== undefined)
        {
            //If current value is more than target + 0.25
            //enable minus actuators
            if(this.value > this.regulationTarget + 0.25)
                this.setActuators("minus", true);
            else
                this.setActuators("minus", false);
    
            //if current value in less than target
            // enable plus actuators otherwise disable plus actuators
            if(this.value < this.regulationTarget)
                this.setActuators("plus", true)
            else
                this.setActuators("plus", false);
        }

        if(this.regulationLogPoints !== undefined && this.regulationTarget !== undefined && this.regulationEnabled !== undefined)
        {
            const newlogPoint: IRegulationStoredData = {
                targetValue: this.regulationTarget,
                currentValue: this.value,
    
                state: this.regulationEnabled,
                time: new Date().toISOString()
            };
    
            //add new logpoint
            this.regulationLogPoints.push(newlogPoint);
    
            //remove first index
            if(this.regulationLogPoints.length >= MAXLOGPOINTS)
                this.regulationLogPoints.splice(0, 1);
        }


        setTimeout(this.regulationLoop.bind(this), 15000);
    }

    /**
     * Set target value of the regulation
     * @param target target value to be reached by regulation
     */
    regulationSetTarget(target: number): boolean { this.regulationTarget = target; return true; }

    /**
     * Enable / Disable regulation
     * @param state state to be set
     * @param manual enable manual modes
     */
    regulationSetState(state: boolean, manual = true): boolean { 
        this.regulationEnabled = state;
    
        if (this.regulationEnabled === true && this.regulation !== undefined)
        {
            LoggerInstance.info("Slot: Enabling " + this.parentSlot.name + '/' + this.io + ' regulation.');

            //if manual modes are defined, toggle them to 1 & lock them.
            if (this.regulation.manualModes && manual) {
                if (typeof this.regulation.manualModes == "string") {
                    const manual = ManualModeController.getInstance().find(this.regulation.manualModes);

                    manual?.setValue(1);
                    manual?.lock();
                }
                else {
                    for (const mn of this.regulation.manualModes) {
                        const manual = ManualModeController.getInstance().find(mn);

                        manual?.setValue(1);
                        manual?.lock();
                    }
                }
            }
            return true;
        }
        else
        {
            LoggerInstance.info("Slot: Disabling " + this.parentSlot.name + '/' + this.io + ' regulation.');

            //if manual modes are defined, toggle them to 0 & unlock them.
            if (this.regulation !== undefined && manual)
            {
                if (typeof this.regulation.manualModes == "string")
                {
                    const manual = ManualModeController.getInstance().find(this.regulation.manualModes);

                    manual?.setValue(0);
                    manual?.unlock();
                }
                else if(this.regulation.manualModes !== undefined)
                {
                    for (const mn of this.regulation.manualModes)
                    {
                        const manual = ManualModeController.getInstance().find(mn);

                        manual?.setValue(0);
                        manual?.unlock();
                    }
                }
            }

            this.setActuators("minus", false);
            this.setActuators("plus", false);

            return true;
        }
        
        return false;
    }

    /**
     * Sets the actuators to the designed set
     * @param actuators actuators to be modified
     * @param state state to be set
     */
    private async setActuators(actuators: "minus" | "plus", state: boolean)
    {
        const acturatorsElement = this.regulation?.actuators[actuators];

        if (acturatorsElement !== undefined)
        {
            if (typeof acturatorsElement === "string")
            {
                await IOController.getInstance().gFinder(acturatorsElement)?.write(state === true ? 1 : 0);
            }
            else
            {
                for (const actuator of acturatorsElement) {
                    await IOController.getInstance().gFinder(actuator)?.write(state === true ? 1 : 0);
                }
            }
        }
    }

    toJSON() : ISlotSensorHydrated
    {
        return {
            io: IOController.getInstance().gFinder(this.io), 
            type: this.type,
            regulation: (this.regulationEnabled !== undefined && this.regulationTarget !== undefined && this.regulationLogPoints !== undefined) ?
            {
                state: this.regulationEnabled,
                current: this.value,
                target: this.regulationTarget,
                logData: this.regulationLogPoints
            } as IRegulationHydrated : undefined
        }
    }
}