import { ESlotSensorType, ISlotSensor } from "../../interfaces/ISlot";
import { IOController } from "../io/IOController";
import { Slot } from "./Slot";

export class SlotSensor implements ISlotSensor
{
    io: string;
    type: ESlotSensorType;
    val: number;

    private ioController: IOController;
    private parentSlot: Slot;

    constructor(slot: Slot, slotsensor: ISlotSensor, iomgr: IOController)
    {
        this.ioController = iomgr;

        this.io = slotsensor.io;
        this.type = slotsensor.type;
        this.val = 0;

        this.parentSlot = slot;
    }

    get value(): number
    {
        const sensorValue = this.ioController.gFinder(this.io)?.value ?? 0;

        //unload slot on minimal sensor limit reached
        if(this.type === ESlotSensorType.LEVEL_NUMERIC_MIN && sensorValue == 0)
        {   
            this.parentSlot.unloadSlot();
        }
        
        return sensorValue;
    }

    toJSON() 
    {
        return {
            io: this.io,
            type: this.type,
            value: this.value,
            unity: this.ioController.gFinder(this.io)?.unity
        }
    }
}