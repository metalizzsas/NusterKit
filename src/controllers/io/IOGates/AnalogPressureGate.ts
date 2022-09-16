import { IIOGate } from "../../../interfaces/gates/IIOGate";
import { map } from "../../../map";
import { IOController } from "../IOController";
import { IOGate } from "./IOGate";

export class AnalogPressureGate extends IOGate
{
    constructor(obj: IIOGate)
    {
        super(obj);
    }

    public async read(ioController: IOController)
    {
        await super.read(ioController);
        ioController.machine.logger.trace("AnalogPressure:" + this.name + ": Reading data from fieldbus.");
        this.value = Math.round(map(this.value, 0, 32767, 0, 160)) / 1000;
        return true;
    }

    public async write(ioController: IOController)
    {
        ioController.machine.logger.warn("AnalogPressure: Nothing to write using this gate type");
        return true;
    }
}