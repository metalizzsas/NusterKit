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

    public async read(ioController: IOController)
    {
        const temp = await ioController.handlers[this.controllerId].readData(this.address, true);
        ioController.machine.logger.trace("PT100Gate-" + this.name + ": Reading data from fieldbus.");

        this.value = temp / 10;
        return true;
    }

    public async write(ioController: IOController)
    {
        ioController.machine.logger.warn("PT100Gate- " + this.name + ": Unable to write data to this gate.");
        return true;
    }
}