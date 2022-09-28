import { LoggerInstance } from "../../../app";
import { IPT100Gate } from "../../../interfaces/gates/IPT100Gate";
import { IOController } from "../IOController";
import { IOGate } from "./IOGate";

export class PT100Gate extends IOGate implements PT100Gate
{
    type: "pt100";

    constructor(obj: IPT100Gate)
    {
        super(obj);
        this.type = "pt100";
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