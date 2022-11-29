import { IOGatesConfig } from "@metalizzsas/nuster-typings/build/spec/iogates";
import { IOControllersConfig } from "@metalizzsas/nuster-typings/build/spec/iophysicalcontrollers";
import { ModbusController } from "./controllers/modbus";

import * as MetalfogMR1 from "@metalizzsas/nuster-turbine-machines/data/metalfog/m/1/specs.json";
import { IMachineSpecs } from "@metalizzsas/nuster-typings";
import { app } from "./server";
import { Response } from "express";

const MachineConfigs = {
    "metalfog/m/1": MetalfogMR1
}

export class SimulationMachine
{
    config: IMachineSpecs;
    controllers: ModbusController[] = [];

    constructor(model: string, variant: string, revision: number)
    {
        this.config = structuredClone(MachineConfigs[`${model}/${variant}/${revision}`]);

        this.setupAutomatons(this.config.iohandlers, this.config.iogates);

        app.get("/", (_, res: Response) => {
            res.json(this.config);
        });

        app.get("/io", (_, res: Response) => {
            res.json(this.config.iogates);
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
            if(controller.type !== "wago")
                continue;
            
            const controllerGates = gates.filter(k => k.controllerId == index);
            this.controllers.push(new ModbusController(controller, controllerGates, index));
        }
    }
}