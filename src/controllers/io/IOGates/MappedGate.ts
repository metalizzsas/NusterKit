import { IMappedGate } from "../../../interfaces/gates/IMappedGate";
import { map } from "../../../map";
import { IOController } from "../IOController";
import { IOGate } from "./IOGate";

export class MappedGate extends IOGate
{
    type: "mapped";

    mapInMin: number;
    mapInMax: number;

    mapOutMin: number;
    mapOutMax: number;

    constructor(obj: IMappedGate)
    {
        super(obj);

        this.type = "mapped";

        this.mapInMin = obj.mapInMin ?? 0;
        this.mapInMax = obj.mapInMax ?? 32767;

        this.mapOutMin = obj.mapOutMin;
        this.mapOutMax = obj.mapOutMax;
    } 

    public async read(ioController: IOController)
    {
        await super.read(ioController);
        
        ioController.machine.logger.trace("MappedGate-" + this.name + ": Reading data from fieldbus.");

        this.value = map(this.value, this.mapInMin, this.mapInMax, this.mapOutMin, this.mapOutMax);
        return true;
    }

    public async write(ioController: IOController, data: number)
    {
        const word = this.size == "word" ? true : undefined;

        this.value = data;

        //resolve value to be written of the fieldbus
        const v = Math.floor(map(data, this.mapOutMin, this.mapOutMax, this.mapInMin, this.mapInMax));

        ioController.machine.logger.trace("MappedGate-" + this.name + ": Writing (" + v + ") to fieldbus.");
        
        await ioController.handlers[this.controllerId].writeData(this.address, v, word)
        return true;
    }
}