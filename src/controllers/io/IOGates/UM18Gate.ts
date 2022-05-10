import { IIOGate, EIOGateSize } from "../../../interfaces/gates/IIOGate";
import { IUM18Gate } from "../../../interfaces/gates/IUM18Gate";
import { map } from "../../../map";
import { IOController } from "../IOController";
import { IOGate } from "./IOGate";

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

        //convert raw value to millimeters
        const tempv = 0.0263 * this.value + 120;

        //this.value = tempv;

        //convert millimeters to Range percentage
        const mapped = map(tempv, this.levelMax, 130, 0, 100);

        //divide percentage to blocks of 5% 
        this.value = Math.ceil(((mapped < 0) ? 0 : mapped) / 5 ) * 5;
        return true;
    }

    public async write(ioController: IOController, data: number)
    {
        const word = this.size == EIOGateSize.WORD ? true : undefined;

        const v = map(data, 0, 100, 0, 32767);

        //TODO: map percentage by @this.level.min/max

        this.value = v;
        
        await ioController.handlers[this.automaton].writeData(this.address, v, word)
        return true;
    }
}
