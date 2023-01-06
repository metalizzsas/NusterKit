import type { PT100Gate as PT100GateConfig } from "@metalizzsas/nuster-typings/build/spec/iogates/";
import { IOGate } from "./IOGate";
import type { IOBase } from "@metalizzsas/nuster-typings/build/spec/iohandlers";
import { TurbineEventLoop } from "../../events";

export class PT100Gate extends IOGate implements PT100GateConfig
{
    // ** Automatic infered types for PT100 Gate **
    type = "pt100" as const;
    unity = "°C" as const;
    size = "word" as const;
    bus = "in" as const;

    constructor(obj: PT100GateConfig, controllerInstance: IOBase)
    {
        super(obj, controllerInstance);
    }

    public async read()
    {
        const temp = await this.controllerInstance.readData(this.address, true);
        this.value = temp / 10;
        TurbineEventLoop.emit(`io.updated.${this.name}`, this);
        
        return true;
    }

    public async write()
    {
        TurbineEventLoop.emit("log", "warning", "PT100Gate- " + this.name + ": Unable to write data to this gate.");
        return true;
    }
}