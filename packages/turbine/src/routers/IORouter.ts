import { Router } from "./Router";
import { DefaultGate } from "../io/IOGates/DefaultGate";

import type { Request, Response } from "express";
import { AuthManager } from "./middleware/auth";
import { MappedGate } from "../io/IOGates/MappedGate";
import { EX260Sx } from "../io/IOHandlers/EX260Sx";
import { WAGO } from "../io/IOHandlers/WAGO";
import { Serial } from "../io/IOHandlers/Serial";
import type { IOGates } from "@metalizzsas/nuster-typings/build/spec/iogates";
import { LoggerInstance } from "../app";
import { PT100Gate } from "../io/IOGates/PT100Gate";
import type { IOBase, IOHandlers } from "@metalizzsas/nuster-typings/build/spec/iohandlers";
import type { IOGatesHydrated } from "@metalizzsas/nuster-typings/build/hydrated/io";
import { TurbineEventLoop } from "../events";

export class IORouter extends Router
{
    /** IO Physical handlers */
    handlers: IOBase[] = [];
    /** IO Physical gates */
    gates: IOGatesHydrated[] = [];

    /** IO Scanner interval timer */
    private timer?: NodeJS.Timer;

    /** IOController Instance */
    private static _instance: IORouter;

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

            if(handler.ioScannerInterval !== undefined)
                this.ioScannerInterval = handler.ioScannerInterval;

            switch(handler.type)
            {
                case "wago": this.handlers.push(new WAGO(handler.ip)); break;
                case "ex260sx": this.handlers.push(new EX260Sx(handler.ip, handler.size)); break;
                case "serial": this.handlers.push(new Serial(handler.port, handler.baudRate)); break;
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
                gate.write(gate.default);
            }
        });
    }

    private _configureRouter()
    {
        AuthManager.getInstance().registerEndpointPermission("io.list", {endpoint: "/v1/io", method: "get"});
        this.router.get("/", (_req: Request, res: Response) => {
            res.json(this.gates);
        });


        AuthManager.getInstance().registerEndpointPermission("io.toggle", {endpoint: new RegExp("/v1/io/.*/.*", "g"), method: "get"});
        this.router.get("/:name/:value", async (req: Request, res: Response) => {

            const name = req.params.name.replace("_", "#");
            const gate = this.gates.find((g) => g.name == name);

            if(gate)
            {
                if(gate.bus != "in")
                {
                    await gate.write(parseInt(req.params.value));
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

    }
    /**
     * Find any gate by its name
     * @param name Gate name to find
     * @returns iogates
     */
    public gFinder(name: string): IOGates | undefined
    {
        return this.gates.find((g) => g.name == name);
    }

    /**
     * Starts The IO Scanner,
     * Scans the inputs to find their data from the Physical controllers
     */
    public startIOScanner()
    {

        if(!this.timer)
        {
            LoggerInstance.info(`IOScanner: Started with interval ${this.ioScannerInterval}ms`);

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