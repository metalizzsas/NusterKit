import { Controller } from "../Controller";
import { DefaultGate } from "./IOGates/DefaultGate";

import type { Request, Response } from "express";
import { AuthManager } from "../../auth/auth";
import { MappedGate } from "./IOGates/MappedGate";
import { PT100Gate } from "./IOGates/PT100Gate";
import { UM18IOGate } from "./IOGates/UM18Gate";
import { EX260Sx } from "./IOHandlers/EX260Sx";
import { WAGO } from "./IOHandlers/WAGO";
import type { IOGates, IOGatesConfig } from "@metalizzsas/nuster-typings/build/spec/iogates";
import type { IMappedGate } from "@metalizzsas/nuster-typings/build/spec/iogates/IMappedGate";
import type { IPT100Gate } from "@metalizzsas/nuster-typings/build/spec/iogates/IPT100Gate";
import type { IUM18Gate } from "@metalizzsas/nuster-typings/build/spec/iogates/IUM18Gate";
import type { IIOPhysicalController, IOControllersConfig } from "@metalizzsas/nuster-typings/build/spec/iophysicalcontrollers";

export class IOController extends Controller
{
    /** IO Physical handlers */
    handlers: IIOPhysicalController[] = [];
    /** IO Physical gates */
    gates: IOGates[] = [];

    /** IO Scanner interval timer */
    private timer?: NodeJS.Timer;

    /** IOController Instance */
    private static _instance: IOController;

    private constructor(handlers: IOControllersConfig[], gates: IOGatesConfig[])
    {
        super();
        this._configureRouter();
        this._configure(handlers, gates);
    }

    /**
     * Get instance of the IOController
     * @param handlers Physical Handlers data
     * @param gates Physical Gates data
     * @throws
     * @returns IO Controller instance
     */
    static getInstance(handlers?: IOControllersConfig[], gates?: IOGatesConfig[]): IOController
    {
        if(!IOController._instance)
            if( handlers !== undefined && gates !== undefined)
                IOController._instance = new IOController(handlers, gates);
            else
                throw new Error("IOController: Failed to instanciate, no data given");

        return IOController._instance;
    }

    private _configure(handlers: IOControllersConfig[], gates: IOGatesConfig[])
    {
        // Register IO Handlers from their types
        for(const handler of handlers)
        {
            if(process.env.NODE_ENV != "production")
                handler.ip = "127.0.0.1";

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
                case "um18": this.gates.push(new UM18IOGate(gate as IUM18Gate)); break;
                case "mapped": this.gates.push(new MappedGate(gate as IMappedGate)); break;
                case "pt100": this.gates.push(new PT100Gate(gate as IPT100Gate)); break;
                case "default": this.gates.push(new DefaultGate(gate)); break;
            }
        }

        this.startIOScanner();
    }

    private _configureRouter()
    {
        AuthManager.getInstance().registerEndpointPermission("io.list", {endpoint: "/v1/io", method: "get"});
        this._router.get("/", (_req: Request, res: Response) => {
            res.json(this.gates);
        });


        AuthManager.getInstance().registerEndpointPermission("io.toggle", {endpoint: new RegExp("/v1/io/.*/.*", "g"), method: "get"});
        this._router.get("/:name/:value", async (req: Request, res: Response) => {

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
            this.timer = setInterval(() => {
                for(const g of this.gates.filter((g) => g.bus == "in"))
                {
                    g.read();
                }

            }, 500);
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
    public get socketData(): [IOGates[], IIOPhysicalController[]]
    {
        return [this.gates, this.handlers];
    }
}