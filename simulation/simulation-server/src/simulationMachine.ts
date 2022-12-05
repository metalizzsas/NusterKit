import { IOGatesConfig } from "@metalizzsas/nuster-typings/build/spec/iogates";
import { IOControllersConfig } from "@metalizzsas/nuster-typings/build/spec/iophysicalcontrollers";
import { ModbusController } from "./controllers/modbus";

import * as MetalfogMR1 from "@metalizzsas/nuster-turbine-machines/data/metalfog/m/1/specs.json";
import { IMachineSpecs } from "@metalizzsas/nuster-typings";
import { app } from "./server";
import type { Request, Response } from "express";
import { ENIPController } from "./controllers/enip";

const MachineConfigs = {
    "metalfog/m/1": MetalfogMR1
}

export class SimulationMachine
{
    config: IMachineSpecs;
    controllers: (ModbusController | ENIPController)[] = [];

    constructor(model: string, variant: string, revision: number)
    {
        this.config = structuredClone(MachineConfigs[`${model}/${variant}/${revision}`]);

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
    setupAutomatons(controllers: IOControllersConfig[], gates: IOGatesConfig[])
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
}