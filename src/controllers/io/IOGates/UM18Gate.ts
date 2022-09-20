import { IUM18Gate } from "../../../interfaces/gates/IUM18Gate";
import { map } from "../../../map";
import { IOController } from "../IOController";
import { IOGate } from "./IOGate";

export class UM18IOGate extends IOGate implements IUM18Gate
{
    type: "um18";

    public levelMax: number;

    constructor(obj: IUM18Gate)
    {
        super(obj);
        
        this.type = "um18";
        this.levelMax = obj.levelMax;
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

    public async write(ioController: IOController)
    {
        ioController.machine.logger.warn("UM18-" + this.name + ": This gate is not able to write data.");
        return true;
    }
}
