import type { IOGates } from "@metalizzsas/nuster-typings/build/spec/iogates";
import type { EX260Sx } from "@metalizzsas/nuster-typings/build/spec/iohandlers";
import { ENIPServer } from "enip-ts/dist/enipServer";
import { ENIPDataVector } from "enip-ts/dist/enipServer/enipClient";

export class ENIPController
{
    private gates: (IOGates & { value: number })[];

    enip: ENIPServer;

    private instanceData: Buffer;

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

    constructor(controller: EX260Sx, gates: IOGates[], index)
    {
        this.enip = new ENIPServer(this.vector);
        this.enip.listen();

        this.index = index;

        this.instanceData = Buffer.alloc(controller.size / 8);

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
        let n = this.instanceData.length == 4 ? this.instanceData.readUInt32LE() : this.instanceData.readUInt16LE();

        let size = this.instanceData.length == 4 ? 31 : 15;

        let mask = 1 << size - address;

        return ((n & mask) > 0) ? 1 : 0;
    }

    private setCoil(address: number, value: number)
    { 
        let data = this.instanceData.length == 4 ? this.instanceData.readUInt32LE() : this.instanceData.readUInt16LE();

        let mask = (value << (31 - address)) >>> 0;

        data ^= mask;

        this.instanceData.writeUInt32LE(data >>> 0);

        const gate = this.gates.find(k => k.address == address);

        if(gate)
            gate.value = this.getCoil(address);
    }

    close()
    {
        //this.enip.close();
    }
}