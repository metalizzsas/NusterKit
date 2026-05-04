import type { IOGates } from "@nuster/turbine/types/spec/iogates";
import type { EX260Sx } from "@nuster/turbine/types/spec/iohandlers";
import { ENIPServer, ENIPDataVector } from "enip-ts/server";

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

    constructor(controller: EX260Sx, gates: (IOGates & { value: number })[], index: number)
    {
        this.enip = new ENIPServer(this.vector);
        this.enip.listen();

        this.index = index;

        this.instanceData = Buffer.alloc(controller.size / 8);

        // Share references with SimulationMachine.config.iogates so readGates()
        // mutations are visible through the /io endpoint.
        this.gates = gates;
    }

    readGates()
    {
        for(const gate of this.gates)
        {
            gate.value = this.getCoil(gate.address);
        }
    }

    private get total_bits(): 16 | 32
    {
        return this.instanceData.length === 4 ? 32 : 16;
    }

    private read_word(): number
    {
        return this.total_bits === 32 ? this.instanceData.readUInt32LE() : this.instanceData.readUInt16LE();
    }

    private write_word(n: number)
    {
        if(this.total_bits === 32)
            this.instanceData.writeUInt32LE(n >>> 0);
        else
            this.instanceData.writeUInt16LE(n & 0xffff);
    }

    private getCoil(address: number): number
    {
        const bit_pos = this.total_bits - 1 - address;
        const mask = (1 << bit_pos) >>> 0;
        return ((this.read_word() & mask) !== 0) ? 1 : 0;
    }

    /** Set a single bit at `address` (MSB-relative) to 0/1 in instanceData. */
    setCoil(address: number, value: number)
    {
        const bit_pos = this.total_bits - 1 - address;
        const mask = (1 << bit_pos) >>> 0;
        let n = this.read_word();

        n = value ? (n | mask) >>> 0 : (n & ~mask) >>> 0;

        this.write_word(n);

        const gate = this.gates.find(k => k.address === address);
        if(gate)
            gate.value = this.getCoil(address);
    }

    get controller_index(): number
    {
        return this.index;
    }

    close()
    {
        this.enip.close().catch(() => { /* best-effort */ });
    }
}