import { Router } from "./Router";
import { DefaultGate } from "../io/IOGates/DefaultGate";

import type { Request, Response } from "express";
import { MappedGate } from "../io/IOGates/MappedGate";
import { EX260Sx } from "../io/IOHandlers/EX260Sx";
import { WAGO } from "../io/IOHandlers/WAGO";
import type { IOGates } from "../types/spec/iogates";
import { PT100Gate } from "../io/IOGates/PT100Gate";
import type { IOBase, IOHandlers } from "../types/spec/iohandlers";
import type { IOGatesHydrated } from "../types/hydrated/io";
import { TurbineEventLoop } from "../events";

export class IORouter extends Router
{
    /** IO Physical handlers */
    handlers: IOBase[] = [];
    /** IO Physical gates */
    gates: IOGatesHydrated[] = [];

    /** IO Scanner interval timer */
    private timer?: ReturnType<typeof setInterval>;

    private ioScannerInterval = 500;

    constructor(handlers: IOHandlers[], gates: IOGates[])
    {
        super();
        this._configureRouter();

        // Register IO Handlers from their types
        for(const handler of handlers)
        {
            if(process.env.NODE_ENV != "production")
                handler.ip = "127.0.0.1";

            if(process.env.SIMULATION_ADDRESS !== undefined)
                handler.ip = process.env.SIMULATION_ADDRESS;

            if(handler.ioScannerInterval !== undefined)
                this.ioScannerInterval = handler.ioScannerInterval;

            switch(handler.type)
            {
                case "wago": this.handlers.push(new WAGO(handler.ip)); break;
                case "ex260sx": this.handlers.push(new EX260Sx(handler.ip, handler.size)); break;
            }
        }
        
        // Register gates from their correspondig type
        for(const gate of gates)
        {
            switch(gate.type)
            {
                case "mapped": this.gates.push(new MappedGate(gate, this.handlers[gate.controllerId])); break;
                case "pt100": this.gates.push(new PT100Gate(gate, this.handlers[gate.controllerId])); break;
                case "default": this.gates.push(new DefaultGate(gate, this.handlers[gate.controllerId])); break;
            }
        }

        this.startIOScanner();

        TurbineEventLoop.on(`io.resetAll`, async () => {
            for(const gate of this.gates.filter(g => g.bus == "out"))
            {
                await gate.write(gate.default);
            }
        });

        TurbineEventLoop.on('io.snapshot', (options) => {

            const snapshot = this.gates.filter(g => g.bus === "out" && g.locked === false).reduce((acc, gate) => {
                acc[gate.name] = gate.value;
                return acc;
            }, {} as Record<string, number>);

            options.callback(snapshot);
        })
    }

    private _configureRouter()
    {
        this.router.post("/:name/:value", async (req: Request, res: Response) => {

            const name = req.params.name.replace("_", "#");
            const gate = this.gates.find((g) => g.name == name);
            
            if(gate === undefined)
            {
                res.status(404).end(`Gate with name ${name} not found.`);
                return;
            }

            if(gate.bus === "in")
            {
                res.status(403).end("Cannot write to an input gate.");
                return;
            }

            const value = (gate.size === "word") ? (parseFloat(req.params.value) || 0) : (req.params.value === "1" ? 1 : 0);

            await gate.write(value);
            res.status(200).end();  
        });
    }

    /**
     * Starts The IO Scanner,
     * Scans the inputs to find their data from the Physical controllers
     */
    public startIOScanner()
    {
        if(!this.timer)
        {
            TurbineEventLoop.emit('log', 'info', `IOScanner: Started with interval ${this.ioScannerInterval}ms`);

            this.timer = setInterval(async () => {
                for(const g of this.gates.filter((g) => g.bus == "in"))
                {
                    await g.read();
                }

            }, this.ioScannerInterval);
        }
    }

    public stopIOScanner()
    {
        if(this.timer)
            clearInterval(this.timer);
    }

    /**
     * Return the data towards the socket
     */
    public get socketData(): IOGatesHydrated[]
    {
        return this.gates;
    }
}