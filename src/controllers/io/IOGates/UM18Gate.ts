import { map } from "../../../map";
import { IOController } from "../IOController";
import { IIOGate, IOGate, IOGateSize } from "./IOGate";

export class UM18IOGate extends IOGate implements IUM18Gate
{
    public levelMax: number;

    constructor(obj: IIOGate, levelMax: number)
    {
        super(obj);

        this.levelMax = levelMax;
    }

    public async read(ioController: IOController)
    {
        await super.read(ioController);
         //convert to mm
        //this.value = map(this.value, 0, 32767, 0, 100);
        const tempv = 0.0263 * this.value + (this.value != 0 ? 120 : 0);

        this.value = map(tempv, this.levelMax * 10, 120, 0, 100);
        return true;
    }

    public async write(ioController: IOController, data: number)
    {
        const word = this.size == IOGateSize.WORD ? true : undefined;

        const v = map(data, 0, 100, 0, 32767);

        //TODO: map percentage by @this.level.min/max

        this.value = v;
        
        await ioController.handlers[this.automaton].writeData(this.address, v, word)
        return true;
    }
}

export interface IUM18Gate extends IIOGate
{
    levelMax: number;
}