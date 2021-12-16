import { map } from "../../../map";
import { IOController } from "../IOController";
import { IIOGate, IOGate } from "./IOGate";

export class UM18IOGate extends IOGate
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
        let word = this.type == "word" ? true : undefined;

        let v = map(data, 0, 100, 0, 32767);

        //TODO: map percentage by @this.level.min/max

        this.value = v;
        
        await ioController.handlers[this.automaton].writeData(this.address, v, word)
        return true;
    }
}