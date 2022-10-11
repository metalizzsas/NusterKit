import { IIOGate, IOGateTypeName, IOGatesConfig } from "@metalizzsas/nuster-typings/src/spec/iogates";
import { LoggerInstance } from "../../../app";
import { IOController } from "../IOController";

export class IOGate implements IIOGate
{
    name: string;
    category: string;

    size: "word" | "bit";
    bus: "out" | "in";
    type: IOGateTypeName;

    controllerId: number;
    address: number;
    default: number;
    unity?: string | undefined;

    /** Gate value read or written to controller */
    value: number;

    constructor(obj: IOGatesConfig)
    {
        this.name = obj.name;
        this.category = (obj.name.split("#").length > 1) ? obj.name.split("#")[0] : "generic";
        this.unity = obj.unity;

        this.size = obj.size;
        this.type = obj.type;
        this.bus = obj.bus;

        this.controllerId = obj.controllerId;
        this.address = obj.address;

        this.default = obj.default;

        // Initialize the gate with its default value
        this.value = obj.default;
    }
    
    async read(): Promise<boolean>
    {
        if(this.bus == 'out') return true;

        const word = this.size == "word" ? true : undefined;

        //LoggerInstance.trace("IOG-" + this.name + ": Reading from fieldbus.");

        this.value = await IOController.getInstance().handlers[this.controllerId].readData(this.address, word);
        return true;
    }

    async write(data: number): Promise<boolean>
    {
        if(this.bus == 'in') return true;
        const word = this.size == "word" ? true : undefined;

        LoggerInstance.trace("IOG-" + this.name + ": Writing (" + data + ") to fieldbus.");

        await IOController.getInstance().handlers[this.controllerId].writeData(this.address, data, word)
        this.value = data;
        return true;
    }
}