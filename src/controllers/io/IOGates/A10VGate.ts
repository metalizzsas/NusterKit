import { IIOGate, IOGateSize } from "../../../interfaces/gates/IIOGate";
import { map } from "../../../map";
import { IOController } from "../IOController";
import { IOGate } from "./IOGate";

export class A10VIOGate extends IOGate
{
    constructor(obj: IIOGate)
    {
        super(obj);
    }

    public async read(ioController: IOController)
    {
        await super.read(ioController);
        ioController.machine.logger.trace("A10V:" + this.name + ": Reading data from fieldbus.");
        this.value = map(this.value, 0, 32767, 0, 100);
        return true;
    }

    public async write(ioController: IOController, data: number)
    {
        const word = this.size == IOGateSize.WORD ? true : undefined;

        this.value = data;

        const v = Math.floor(map(data, 0, 100, 0, 32767));

        ioController.machine.logger.trace("A10V-" + this.name + ": Writing (" + v + ") to fieldbus.");
        
        await ioController.handlers[this.automaton].writeData(this.address, v, word)
        return true;
    }
}