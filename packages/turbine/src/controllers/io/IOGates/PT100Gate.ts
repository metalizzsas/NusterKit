import { IIOGate } from "@metalizzsas/nuster-typings/src/spec/iogates";
import { IPT100Gate } from "@metalizzsas/nuster-typings/src/spec/iogates/IPT100Gate";
import { LoggerInstance } from "../../../app";
import { IOController } from "../IOController";
import { IOGate } from "./IOGate";

export class PT100Gate extends IOGate implements IIOGate, IPT100Gate
{
    // ** Automatic infered types for PT100 Gate **
    type = "pt100" as const;
    unity = "°C" as const;
    size = "word" as const;
    bus = "in" as const;

    constructor(obj: IPT100Gate)
    {
        super(obj);
    }

    public async read()
    {
        const temp = await IOController.getInstance().handlers[this.controllerId].readData(this.address, true);
        LoggerInstance.trace("PT100Gate-" + this.name + ": Reading data from fieldbus.");

        this.value = temp / 10;
        return true;
    }

    public async write()
    {
        LoggerInstance.warn("PT100Gate- " + this.name + ": Unable to write data to this gate.");
        return true;
    }
}