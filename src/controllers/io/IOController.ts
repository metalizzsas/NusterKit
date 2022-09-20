import { IOGate } from "./IOGates/IOGate";
import { IOHandler } from "./IOHandlers/IOHandler";
import { Controller } from "../Controller";
import { Machine } from "../../Machine";

import { Request, Response } from "express";
import { WAGO } from "./IOHandlers/WAGO";
import { EX260S1 } from "./IOHandlers/EX260S1";
import { EX260S3 } from "./IOHandlers/EX260S3";
import { UM18IOGate } from "./IOGates/UM18Gate";
import { IUM18Gate } from "../../interfaces/gates/IUM18Gate";
import { EM4 } from "./IOHandlers/EM4";
import { PT100Gate } from "./IOGates/PT100Gate";
import { EIOHandlerType } from "../../interfaces/IIOHandler";
import { MappedGate } from "./IOGates/MappedGate";
import { IMappedGate } from "../../interfaces/gates/IMappedGate";
import { IPT100Gate } from "../../interfaces/gates/IPT100Gate";

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
        // Register IO Handlers from their types
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
        
        // Register gates from their correspondig type
        for(const gate of this.machine.specs.iogates)
        {
            switch(gate.type)
            {
                case "um18": this.gates.push(new UM18IOGate(gate as IUM18Gate)); break;
                case "mapped": this.gates.push(new MappedGate(gate as IMappedGate)); break;
                case "pt100": this.gates.push(new PT100Gate(gate as IPT100Gate)); break;

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
                if(gate.bus != "in")
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
                for(const g of this.gates.filter((g) => g.bus == "in"))
                {
                    //skip the io read if the automaton is an EM4
                    if(this.machine.ioController.handlers.at(g.controllerId)?.type == EIOHandlerType.EM4)
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