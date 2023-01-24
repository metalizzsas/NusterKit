import type { IOGates } from "@metalizzsas/nuster-typings/build/spec/iogates";
import type { IOHandlers } from "@metalizzsas/nuster-typings/build/spec/iohandlers";
import { ModbusController } from "./controllers/modbus";

import type { Addon, MachineSpecs } from "@metalizzsas/nuster-typings";
import { app } from "./server";
import type { Request, Response } from "express";
import { ENIPController } from "./controllers/enip";
import { deepInsert } from "./deepInsert";
import { Machines } from "@metalizzsas/nuster-turbine-machines";

export class SimulationMachine
{
    config: MachineSpecs;
    controllers: (ModbusController | ENIPController)[] = [];

    constructor(model: string, variant: string, revision: number, addons: string[] = [])
    {
        const cfg = Machines[`${model}-${variant}-${revision}`];

        if(cfg === undefined)
            throw "Failed to find machine configuration";

        this.config = structuredClone(cfg);

        for(const addon of addons)
        {
            const addonConfig = this.config.addons.find(k => k.addonName === addon);
            if(addonConfig === undefined)
            {
                console.log("Failed to add", addon);
                continue;
            }

            this.config = parseAddon(this.config, addonConfig);
        }
        
        this.setupAutomatons(this.config.iohandlers, this.config.iogates);

        app.get("/", (_, res: Response) => {
            res.json(this.config);
        });

        app.get("/io", (_, res: Response) => {

            for(const o of this.controllers.filter(k => k instanceof ENIPController))
            {
                //@ts-ignore
                o.readGates();
            }

            res.json(this.config.iogates);
        });

        app.get(`/io/:name`, (req: Request, res: Response) => {
            req.params.name = req.params.name.replace("_", "#");

            const gate = this.config.iogates.find(k => k.name == req.params.name);

            res.status(gate !== undefined ? 200 : 404).json(gate);

        });

        app.post(`/io/:name/:value`, (req: Request, res: Response) => {

            req.params.name = req.params.name.replace("_", "#");
            const gate = this.config.iogates.find(k => k.name == req.params.name);

            if(gate === undefined)
            {
                res.status(404).end();
                return;
            }
            
            //@ts-ignore
            gate.value = parseInt(req.params.value);

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