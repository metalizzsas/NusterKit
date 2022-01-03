import { IOGate, IOGateBus, IOGateType } from "./IOGates/IOGate";
import { IOHandler } from "./IOHandlers/IOHandler";
import { Controller } from "../Controller";
import { Machine } from "../../Machine";

import { Request, Response } from "express";
import { WAGO } from "./IOHandlers/WAGO";
import { EX260S1 } from "./IOHandlers/EX260S1";
import { EX260S3 } from "./IOHandlers/EX260S3";
import { A10VIOGate } from "./IOGates/A10VGate";
import { UM18IOGate } from "./IOGates/UM18Gate";
import path from "path";

export class IOController extends Controller
{
    handlers: IOHandler[] = []
    gates: IOGate[] = []

    private machine: Machine;

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

            switch(handler.name)
            {
                case "WAGO": this.handlers.push(new WAGO(handler.ip)); break;
                case "EX260S3": this.handlers.push(new EX260S3(handler.ip)); break;
                case "EX260S1": this.handlers.push(new EX260S1(handler.ip)); break;
                default: this.handlers.push(new IOHandler(handler.name, handler.type, handler.ip)); break;
            }
        }
        
        for(const gate of this.machine.specs.iogates)
        {
            switch(gate.type)
            {
                case IOGateType.UM18: this.gates.push(new UM18IOGate(gate)); break;
                case IOGateType.A10V: this.gates.push(new A10VIOGate(gate)); break;
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

        this._router.get("/realtime", (_req: Request, res: Response) => {
            res.sendFile(path.join(__dirname, "../../../pages/io.html"));
        });

        this.machine.authManager.registerEndpointPermission("io.list", {endpoint: "/v1/io/realtime", method: "get"});

        this._router.get("/:name/:value", async (req: Request, res: Response) => {

            const gate = this.gates.find((g) => g.name == req.params.name);

            if(gate)
            {
                if(gate.bus != IOGateBus.IN)
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
            this.timer = setInterval(() => {
                for(const g of this.gates.filter((g) => g.bus == IOGateBus.IN))
                    g.read(this);
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