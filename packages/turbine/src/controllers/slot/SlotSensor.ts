import { ESlotSensorType, ISlotSensor } from "@metalizzsas/nuster-typings/src/spec/slot";
import { IOController } from "../io/IOController";
import { Slot } from "./Slot";

export class SlotSensor implements ISlotSensor
{
    io: string;
    type: ESlotSensorType;
    val: number;

    private parentSlot: Slot;

    constructor(slot: Slot, slotsensor: ISlotSensor)
    {
        this.io = slotsensor.io;
        this.type = slotsensor.type;
        this.val = 0;

        this.parentSlot = slot;
    }

    get value(): number
    {
        const sensorValue = IOController.getInstance().gFinder(this.io)?.value ?? 0;

        //unload slot on minimal sensor limit reached
        if(this.type === ESlotSensorType.LEVEL_NUMERIC_MIN && sensorValue == 0)
            this.parentSlot.unloadSlot();
        
        return sensorValue;
    }

    toJSON() 
    {
        return {
            io: this.io,
            type: this.type,
            value: this.value,
            unity: IOController.getInstance().gFinder(this.io)?.unity
        }
    }
}