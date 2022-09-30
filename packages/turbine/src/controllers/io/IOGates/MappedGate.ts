import { LoggerInstance } from "../../../app";
import { IIOGate } from "../../../interfaces/gates/IIOGate";
import { IMappedGate } from "../../../interfaces/gates/IMappedGate";
import { map } from "../../../map";
import { IOController } from "../IOController";
import { IOGate } from "./IOGate";

export class MappedGate extends IOGate implements IIOGate, IMappedGate
{
    type = "mapped" as const;
    size = "word" as const;

    mapInMin: number;
    mapInMax: number;

    mapOutMin: number;
    mapOutMax: number;

    constructor(obj: IMappedGate)
    {
        super(obj);
        
        this.mapInMin = obj.mapInMin ?? 0;
        this.mapInMax = obj.mapInMax ?? 32767;

        this.mapOutMin = obj.mapOutMin;
        this.mapOutMax = obj.mapOutMax;
    } 

    public async read()
    {
        await super.read();
        
        LoggerInstance.trace("MappedGate-" + this.name + ": Reading data from fieldbus.");

        this.value = map(this.value, this.mapInMin, this.mapInMax, this.mapOutMin, this.mapOutMax);
        return true;
    }

    public async write(data: number)
    {
        const word = this.size == "word" ? true : undefined;

        this.value = data;

        //resolve value to be written of the fieldbus
        const v = Math.floor(map(data, this.mapOutMin, this.mapOutMax, this.mapInMin, this.mapInMax));

        LoggerInstance.trace("MappedGate-" + this.name + ": Writing (" + v + ") to fieldbus.");
        
        await IOController.getInstance().handlers[this.controllerId].writeData(this.address, v, word)
        return true;
    }
}