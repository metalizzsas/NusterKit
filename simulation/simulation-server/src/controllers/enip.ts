import { IOGatesConfig } from "@metalizzsas/nuster-typings/build/spec/iogates";
import { IOControllersConfig } from "@metalizzsas/nuster-typings/build/spec/iophysicalcontrollers";
import { ENIPServer } from "enip-ts/dist/enipServer";
import { ENIPDataVector } from "enip-ts/dist/enipServer/enipClient";

export class ENIPController
{
    private gates: (IOGatesConfig & { value: number })[];

    enip: ENIPServer;

    private instanceData = Buffer.alloc(4);

    private index: number;

    private vector: ENIPDataVector = {
        0x0E: (data) => {
            if(data.path.class == 4 && data.path.instance == 150 && data.path.attribute == 3)
            {
                return this.instanceData;
            }
            else
                return;
        },
        0x10: (data) => {
            if(data.path.class == 4 && data.path.instance == 150 && data.path.attribute == 3 && data.data)
            {
                this.instanceData.set(data.data);
                return this.instanceData;
            }
            else
                return;
        }
    };

    constructor(controller: IOControllersConfig, gates: IOGatesConfig[], index)
    {
        this.enip = new ENIPServer(this.vector);
        this.enip.listen();

        this.index = index;

        //@ts-ignore
        this.gates = gates.map(k => { k.value = k.default; return k;});
    }

    readGates()
    {
        for(const gate of this.gates)
        {
            gate.value = this.getCoil(gate.address);
        }
    }

    private getCoil(address: number): number
    {
        let n = this.instanceData.readUInt32LE();

        let mask = 1 << 31 - address;

        return ((n & mask) > 0) ? 1 : 0;
    }

    private setCoil(address: number, value: number)
    { 
        let data = this.instanceData.readUint32LE();

        let mask = (value << (31 - address)) >>> 0;

        data ^= mask;

        this.instanceData.writeUInt32LE(data >>> 0);

        const gate = this.gates.find(k => k.address == address);

        if(gate)
            gate.value = this.getCoil(address);
    }
}