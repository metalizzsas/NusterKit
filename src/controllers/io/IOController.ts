import { IOGate, IOGateBus } from "./IOGate"
import { IOHandler } from "./IOHandlers/IOHandler"
import { Controller } from "../Controller"
import { Machine } from "../../Machine";

import {Request, Response } from "express";
import { WAGO } from "./IOHandlers/WAGO";
import { EX260S3 } from "./IOHandlers/EX260S3";

export class IOController extends Controller
{
    handlers: IOHandler[] = []
    gates: IOGate[] = []

    private machine: Machine

    constructor(machine: Machine)
    {
        super()

        this.machine = machine;

        this._configureRouter()
        this._configure()
    }

    private _configure()
    {
        for(let handler of this.machine.specs.iohandlers)
        {
            switch(handler.name)
            {
                case "WAGO": this.handlers.push(new WAGO(handler.ip)); break;
                //case "EX260S3": this.handlers.push(new EX260S3(handler.ip)); break;
                default: this.handlers.push(new IOHandler(handler.name, handler.type, handler.ip)); break;
            }
            
            //TODO: Connect to Handler
        }

        for(let gate of this.machine.specs.iogates)
        {
            this.gates.push(new IOGate(gate.name, gate.type, gate.bus, gate.automaton, gate.address, gate.default))

            //TODO: Update each gates
        }
    }

    private _configureRouter()
    {
        this._router.get("/", (req: Request, res: Response) => {

            //TODO: Read all inputs gates to get new vaue each time request is asked

            res.json(this.gates);
        });

        this._router.get("/:name/:value", async (req: Request, res: Response) => {

            let index = this.gates.findIndex((g) => g.name == req.params.name);

            if(index > -1)
            {
                if(this.gates[index].bus != IOGateBus.IN)
                {
                    //TODO: Update gate to value specified
                    await this.gates[index].write(this, parseInt(req.params.value));
                    res.status(200).end();
                }
                else
                {
                    res.status(403).end();
                }
            }
            else
            {
                res.status(404).end();
                return;
            }
        });
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
}