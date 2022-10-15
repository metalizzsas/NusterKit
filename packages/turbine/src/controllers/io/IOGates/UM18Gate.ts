import type { IUM18Gate } from "@metalizzsas/nuster-typings/build/spec/iogates/IUM18Gate";
import { LoggerInstance } from "../../../app";
import { map } from "../../../map";
import { IOGate } from "./IOGate";

export class UM18IOGate extends IOGate implements IUM18Gate
{
    type = "um18" as const;

    levelMax: number;

    constructor(obj: IUM18Gate)
    {
        super(obj);
        this.levelMax = obj.levelMax;
    }

    public async read()
    {
        await super.read();

        //convert raw value to millimeters
        const tempv = 0.0263 * this.value + 120;

        //this.value = tempv;

        //convert millimeters to Range percentage
        const mapped = map(tempv, this.levelMax, 130, 0, 100);

        //divide percentage to blocks of 5% 
        this.value = Math.ceil(((mapped < 0) ? 0 : mapped) / 5 ) * 5;
        return true;
    }

    public async write()
    {
        LoggerInstance.warn("UM18-" + this.name + ": This gate is not able to write data.");
        return true;
    }
}
