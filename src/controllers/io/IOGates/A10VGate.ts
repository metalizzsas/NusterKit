import { map } from "../../../map";
import { IOController } from "../IOController";
import { IIOGate, IOGate, IOGateSize } from "./IOGate";

export class A10VIOGate extends IOGate
{
    constructor(obj: IIOGate)
    {
        super(obj);
    }

    public async read(ioController: IOController)
    {
        await super.read(ioController);
        this.value = map(this.value, 0, 32767, 0, 100);
        return true;
    }

    public async write(ioController: IOController, data: number)
    {
        const word = this.size == IOGateSize.WORD ? true : undefined;

        this.value = data;

        const v = map(data, 0, 100, 0, 32767);
        
        await ioController.handlers[this.automaton].writeData(this.address, v, word)
        return true;
    }
}