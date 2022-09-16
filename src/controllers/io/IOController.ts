import { IOGate } from "./IOGates/IOGate";
import { IOHandler } from "./IOHandlers/IOHandler";
import { Controller } from "../Controller";
import { Machine } from "../../Machine";

import { Request, Response } from "express";
import { WAGO } from "./IOHandlers/WAGO";
import { EX260S1 } from "./IOHandlers/EX260S1";
import { EX260S3 } from "./IOHandlers/EX260S3";
import { A10VIOGate } from "./IOGates/A10VGate";
import { UM18IOGate } from "./IOGates/UM18Gate";
import { EIOGateType, EIOGateBus } from "../../interfaces/gates/IIOGate";
import { IUM18Gate } from "../../interfaces/gates/IUM18Gate";
import { EM4 } from "./IOHandlers/EM4";
import { EM4A10VIOGate } from "./IOGates/EM4A10VGate";
import { PT100Gate } from "./IOGates/PT100Gate";
import { AnalogPressureGate } from "./IOGates/AnalogPressureGate";
import { EIOHandlerType } from "../../interfaces/IIOHandler";

export class IOController extends Controller
{
    handlers: IOHandler[] = []
    gates: IOGate[] = []

    machine: Machine;

    private timer?: NodeJS.Timer;

    constructor(machine: Machine)
    {
        super()

        this.machine = machine;

        this._configureRouter()
        this._configure()
    }

    private _configure()
    {
        for(const handler of this.machine.specs.iohandlers)
        {
            if(process.env.NODE_ENV != "production")
                handler.ip = "127.0.0.1";

            switch(handler.type)
            {
                case EIOHandlerType.WAGO: this.handlers.push(new WAGO(handler.ip, this.machine)); break;
                case EIOHandlerType.EM4: this.handlers.push(new EM4(handler.ip, this.machine)); break;
                case EIOHandlerType.EX260S1: this.handlers.push(new EX260S1(handler.ip, this.machine)); break;
                case EIOHandlerType.EX260S3: this.handlers.push(new EX260S3(handler.ip, this.machine)); break;

                default: this.handlers.push(new IOHandler(handler.name, handler.type, handler.ip)); break;
            }
        }
        
        for(const gate of this.machine.specs.iogates)
        {
            switch(gate.type)
            {
                case EIOGateType.UM18: this.gates.push(new UM18IOGate(gate, (gate as IUM18Gate).levelMax)); break;

                case EIOGateType.A10V: this.gates.push(new A10VIOGate(gate)); break;
                case EIOGateType.EM4A10V: this.gates.push(new EM4A10VIOGate(gate)); break;

                case EIOGateType.PT100: this.gates.push(new PT100Gate(gate)); break;
                case EIOGateType.ANALOG_PRESSURE: this.gates.push(new AnalogPressureGate(gate)); break;

                default: this.gates.push(new IOGate(gate)); break;
            }
        }

        this.startIOScanner();
    }

    private _configureRouter()
    {
        this._router.get("/", (_req: Request, res: Response) => {
            res.json(this.gates);
        });

        this.machine.authManager.registerEndpointPermission("io.list", {endpoint: "/v1/io", method: "get"});

        this._router.get("/:name/:value", async (req: Request, res: Response) => {

            const name = req.params.name.replace("_", "#");

            const gate = this.gates.find((g) => g.name == name);

            if(gate)
            {
                if(gate.bus != EIOGateBus.IN)
                {
                    await gate.write(this, parseInt(req.params.value));
                    res.status(200).end();
                }
                else
                    res.status(403).end();
            }
            else
            {
                res.status(404).end();
                return;
            }
        });

        this.machine.authManager.registerEndpointPermission("io.toggle", {endpoint: new RegExp("/v1/io/.*/.*", "g"), method: "get"});
    }
    /**
     * Find any gate by its name
     * @param name Gate name to find
     * @returns iogates
     */
    public gFinder(name: string): IOGate | undefined
    {
        return this.gates.find((g) => g.name == name);
    }

    public startIOScanner()
    {
        if(!this.timer)
        {
            let skip = 1;
            this.timer = setInterval(() => {
                for(const g of this.gates.filter((g) => g.bus == EIOGateBus.IN))
                {
                    //skip the io read if the automaton is an EM4
                    if(this.machine.ioController.handlers.at(g.automaton)?.type == EIOHandlerType.EM4)
                        continue;
                    
                    if(g.isCritical || skip > 4)
                            g.read(this);
                    
                    skip > 4 ? skip = 1 : skip++;
                }

            }, 500);
        }
    }

    public stopIOScanner()
    {
        if(this.timer)
            clearInterval(this.timer);
    }

    public get socketData()
    {
        return [this.gates, this.handlers];
    }
}