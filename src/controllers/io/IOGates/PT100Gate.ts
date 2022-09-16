import { IIOGate } from "../../../interfaces/gates/IIOGate";
import { IOController } from "../IOController";
import { IOGate } from "./IOGate";

export class PT100Gate extends IOGate
{
    constructor(obj: IIOGate)
    {
        super(obj);
    }

    public async read(ioController: IOController)
    {
        const temp = await ioController.handlers[this.automaton].readData(this.address, true);
        ioController.machine.logger.trace("PT100Gate: " + this.name + ": Reading data from fieldbus.");

        this.value = temp / 10;
        return true;
    }

    public async write(ioController: IOController, data: number)
    {
        ioController.machine.logger.warn("PT100Gate: Unable to write data to this gate.");
        return true;
    }
}