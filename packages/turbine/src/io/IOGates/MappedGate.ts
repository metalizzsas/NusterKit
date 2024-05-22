import { map } from "../../utils/map";
import { IOGate } from "./IOGate";
import { TurbineEventLoop } from "../../events";
import type { MappedGate as MappedGateConfig } from "$types/spec/iogates";
import type { IOBase } from "$types/spec/iohandlers";

export class MappedGate extends IOGate implements MappedGate
{
    type = "mapped" as const;
    size = "word" as const;

    mapInMin: number;
    mapInMax: number;

    mapOutMin: number;
    mapOutMax: number;

    constructor(obj: MappedGateConfig, controllerInstance: IOBase)
    {
        super(obj, controllerInstance);
        
        this.mapInMin = obj.mapInMin ?? 0;
        this.mapInMax = obj.mapInMax ?? 32767;

        this.mapOutMin = obj.mapOutMin;
        this.mapOutMax = obj.mapOutMax;
    } 

    public async read()
    {
        const v = await super.readFromController(true);
        const newVal = Math.floor(map(v, this.mapInMin, this.mapInMax, this.mapOutMin, this.mapOutMax) * 100) / 100;
        this.value = newVal < 0 ? 0 : newVal;

        TurbineEventLoop.emit(`io.updated.${this.name}`, this.toJSON());

        return true;
    }

    public async write(data: number)
    {
        this.value = data;

        //resolve value to be written of the fieldbus
        let v = Math.floor(map(data, this.mapOutMin, this.mapOutMax, this.mapInMin, this.mapInMax));
        v = (v < 0) ? 0 : v;
        
        TurbineEventLoop.emit(`io.updated.${this.name}`, this.toJSON());
        TurbineEventLoop.emit("log", "info", "IOMG-" + this.name + ": Writing (" + data + ") to fieldbus.");

        return super.writetoController(v, true);
    }

    toJSON() {
        return {
            name: this.name,
            type: this.type,
            locked: this.locked,
            category: this.category,
            value: this.value,
            unity: this.unity,
            bus: this.bus,
            size: this.size,

            mapOutMin: this.mapOutMin,
            mapOutMax: this.mapOutMax
        }
    }
}