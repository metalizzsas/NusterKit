import { map } from "../../utils/map";
import { IOGate } from "./IOGate";
import { TurbineEventLoop } from "../../events";
import type { MappedGate as MappedGateConfig } from "@metalizzsas/nuster-typings/build/spec/iogates";
import type { IOBase } from "@metalizzsas/nuster-typings/build/spec/iohandlers";

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
    
        this.value = Math.floor(map(v, this.mapInMin, this.mapInMax, this.mapOutMin, this.mapOutMax) * 100) / 100;

        TurbineEventLoop.emit(`io.updated.${this.name}`, this.toJSON());

        return true;
    }

    public async write(data: number)
    {
        this.value = data;

        //resolve value to be written of the fieldbus
        const v = Math.floor(map(data, this.mapOutMin, this.mapOutMax, this.mapInMin, this.mapInMax));

        TurbineEventLoop.emit(`io.updated.${this.name}`, this.toJSON());

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