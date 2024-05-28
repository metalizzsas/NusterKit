import type { IOGates } from "@nuster/turbine/types/spec/iogates";
import type { IOHandlers } from "@nuster/turbine/types/spec/iohandlers";
import type { Configuration, MachineSpecs, Addon } from "@nuster/turbine/types";
import { ModbusController } from "./controllers/modbus";

import { Request, Response, Router as ExpressRouter } from "express";
import { ENIPController } from "./controllers/enip";
import { deepInsert } from "./deepInsert";

function map(source: number, inMin: number, inMax: number, outMin: number, outMax: number)
{
  return (source - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

export class SimulationMachine
{
    config: MachineSpecs;
    controllers: (ModbusController | ENIPController)[] = [];

    router: ExpressRouter;

    constructor(configuration: Configuration, specs: MachineSpecs)
    {
        this.router = ExpressRouter();
        this.config = structuredClone(specs);

        for(const addon of configuration.addons)
        {
            const addonConfig = this.config.addons?.find(k => k.addonName === addon);
            if(addonConfig === undefined)
            {
                console.log("Failed to add", addon);
                continue;
            }

            this.config = parseAddon(this.config, addonConfig);
        }
        
        this.setupAutomatons(this.config.iohandlers, this.config.iogates);

        this.router.get("/", (_, res: Response) => {
            res.json(this.config);
        });

        this.router.get("/io", (_, res: Response) => {

            for(const o of this.controllers.filter(k => k instanceof ENIPController))
            {
                //@ts-ignore
                o.readGates();
            }

            res.json(this.config.iogates);
        });

        this.router.get(`/io/:name`, (req: Request, res: Response) => {
            req.params.name = req.params.name.replace("_", "#");

            const gate = this.config.iogates.find(k => k.name == req.params.name);

            res.status(gate !== undefined ? 200 : 404).json(gate);

        });

        this.router.post(`/io/:name/:value`, (req: Request, res: Response) => {

            req.params.name = req.params.name.replace("_", "#");
            const gate = this.config.iogates.find(k => k.name == req.params.name);

            if(gate === undefined)
            {
                res.status(404).end();
                return;
            }

            if(gate.type === "pt100"){
                //@ts-ignore
                gate.value = parseInt(req.params.value) * 10;
            }
            else if(gate.type === "mapped")
            {
                //@ts-ignore
                gate.value = map(parseFloat(req.params.value), gate.mapOutMin, gate.mapOutMax, gate.mapInMin, gate.mapInMax);
            }
            else
            {
                //@ts-ignore
                gate.value = parseInt(req.params.value);
            }
            

            res.status(200);
            res.write("ok");
            res.end();
        });
    }

    /**
     * Setup controllers
     * @param controllers 
     * @param gates 
     */
    setupAutomatons(controllers: IOHandlers[], gates: IOGates[])
    {
        for(const [index, controller] of controllers.entries())
        {
            const controllerGates = gates.filter(k => k.controllerId == index);
            switch(controller.type)
            {
                case "wago": this.controllers.push(new ModbusController(controller, controllerGates, index)); break;
                case "ex260sx": this.controllers.push(new ENIPController(controller, controllerGates, index)); break;
            }
        }
    }

    dispose()
    {
        for(const handler of this.controllers)
        {
            handler.close();
        }
    }

    get expressRouter()
    {
        return this.router;
    }
}

export function parseAddon(specs: MachineSpecs, addon: Addon): MachineSpecs
{
    console.log("AddonLoader: Adding " + addon.addonName + ".");

    for(const content of addon.content)
    {
        console.log(" ↳ Adding content on " + content.path + " with " + content.mode + " mode.")
        specs = deepInsert(specs, content.content, content.path, content.mode);
    }

    return specs;
}