import { IOGate, IOGateBus } from "../classes/IOGate"
import { IOHandler } from "../classes/IOHandlers/IOHandler"
import { Controller } from "./Controller"

import fs from "fs";
import path from "path";
import { Machine } from "../classes/Machine";

import {Request, Response } from "express";


export class IOController extends Controller
{
    private handlers: IOHandler[] = []
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
            this.handlers.push(new IOHandler(handler.name, handler.type, handler.ip));

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

        this._router.post("/:name/:value", async (req: Request, res: Response) => {

            let index = this.gates.findIndex((value: IOGate) => {value.name == req.params.name });

            if(index > -1)
            {
                if(this.gates[index].bus == IOGateBus.IN)
                {
                    //TODO: Update gate to value specified
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
}