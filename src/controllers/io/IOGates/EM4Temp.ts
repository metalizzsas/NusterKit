import { IIOGate, EIOGateSize } from "../../../interfaces/gates/IIOGate";
import { IOController } from "../IOController";
import { IOGate } from "./IOGate";

export class EM4TempGate extends IOGate
{
    constructor(obj: IIOGate)
    {
        super(obj);
    }

    public async read(ioController: IOController)
    {
        await super.read(ioController);
        ioController.machine.logger.trace("EM4Temp: " + this.name + ": Reading data from fieldbus.");
        return true;
    }

    public async write(ioController: IOController, data: number)
    {
        const word = this.size == EIOGateSize.WORD ? true : undefined;

        this.value = data;

        ioController.machine.logger.trace("EM4Temp: " + this.name + ": Writing (" + data + ") to fieldbus.");
        
        await ioController.handlers[this.automaton].writeData(this.address, data, word)
        return true;
    }
}