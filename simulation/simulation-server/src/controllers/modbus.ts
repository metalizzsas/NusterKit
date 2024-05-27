import type { IOGates } from "@nuster/turbine/types/spec/iogates";
import type { IOHandlers } from "@nuster/turbine/types/spec/iohandlers";
import { type IServiceVector } from "modbus-serial/ServerTCP";
import { ServerTCP } from "modbus-serial";

export class ModbusController
{
    private gates: (IOGates & { value: number })[];

    modbus: ServerTCP;

    index: number;

    constructor(controller: IOHandlers, gates: IOGates[], index: number)
    {
        this.index = index;
        
        //@ts-ignore
        this.gates = gates.map(k => { k.value = k.default; return k;});

        const vector: IServiceVector = {
            getCoil: this.getCoil.bind(this),
            getDiscreteInput: this.getCoil.bind(this),

            getHoldingRegister: this.getRegister.bind(this),
            getInputRegister: this.getRegister.bind(this),
            
            setCoil: this.setCoil.bind(this),
            setRegister: this.setRegister.bind(this)
        };

        this.modbus = new ServerTCP(vector, { host: '0.0.0.0', port: 502 + index, debug: true, unitID: 1 });

        console.log("Created modbus server");
    }

    private getCoil(address: number): boolean {
        const gate = this.gates.find(k => k.address == address && k.size == "bit" && k.bus == "in");
        return (gate.value ?? 0) === 1;
    }

    private getRegister(address: number): number {
        const gate = this.gates.find(k => k.address == address && k.size == "word" && k.bus == "in");
        return gate.value ?? 0;
    }

    private setCoil(address: number, value: boolean)
    {
        const gate = this.gates.find(k => k.address == address && k.size == "bit" && k.bus == "out");
        gate.value = value == true ? 1 : 0;
    }

    private setRegister(address: number, value: number)
    {
        const gate = this.gates.find(k => k.address == address && k.size == "word" && k.bus == "out");
        gate.value = value;
    }

    close()
    {
        this.modbus.close(() => {});
    }
}