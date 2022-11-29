import { IOGatesConfig } from "@metalizzsas/nuster-typings/build/spec/iogates";
import { IOControllersConfig } from "@metalizzsas/nuster-typings/build/spec/iophysicalcontrollers";
import { type IServiceVector } from "modbus-serial/ServerTCP";
import { ServerTCP } from "modbus-serial";

import { app } from "../server";
import { Request, Response } from "express";

export class ModbusController
{
    private gates: (IOGatesConfig & { value: number })[];

    modbus: ServerTCP;

    index: number;

    constructor(controller: IOControllersConfig, gates: IOGatesConfig[], index: number)
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

        this.modbus = new ServerTCP(vector, { host: '0.0.0.0', port: 502, debug: true, unitID: 1 });

        console.log("Created modbus server");

        app.get(`/controller/${this.index}/:name`, (req: Request, res: Response) => {
            req.params.name = req.params.name.replace("_", "#");

            const gate = this.gates.find(k => k.name == req.params.name);

            res.status(gate !== undefined ? 200 : 404).json(gate);

        });

        app.post(`/controller/${this.index}/:name/:value`, (req: Request, res: Response) => {

            req.params.name = req.params.name.replace("_", "#");
            const gate = this.gates.find(k => k.name == req.params.name);

            if(gate === undefined)
            {
                res.status(404).end();
                return;
            }
            
            gate.value = parseInt(req.params.value);

            res.status(200);
            res.write("ok");
            res.end();
        });
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
}