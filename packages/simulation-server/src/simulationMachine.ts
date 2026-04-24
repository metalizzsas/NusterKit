import type { IOGates } from "@nuster/turbine/types/spec/iogates";
import type { IOHandlers } from "@nuster/turbine/types/spec/iohandlers";
import type { Configuration, MachineSpecs, Addon } from "@nuster/turbine/types";
import { ModbusController } from "./controllers/modbus";

import { Request, Response, Router as ExpressRouter } from "express";
import { ENIPController } from "./controllers/enip";
import { RevolutionPiController } from "./controllers/revolution-pi";
import { deepInsert } from "./deepInsert";

/** IOGates extended with a runtime `value` field for simulation */
type SimulationGate = IOGates & { value: number };

function map(source: number, inMin: number, inMax: number, outMin: number, outMax: number)
{
  return (source - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

export class SimulationMachine
{
    config: MachineSpecs & { iogates: SimulationGate[] };
    controllers: (ModbusController | ENIPController | RevolutionPiController)[] = [];

    router: ExpressRouter;

    constructor(configuration: Configuration, specs: MachineSpecs)
    {
        this.router = ExpressRouter();
        let base = structuredClone(specs);

        for(const addon of configuration.addons)
        {
            const addonConfig = base.addons?.find(k => k.addonName === addon);
            if(addonConfig === undefined)
            {
                console.log("Failed to add", addon);
                continue;
            }

            base = parseAddon(base, addonConfig);
        }

        this.config = { ...base, iogates: base.iogates.map(g => ({ ...g, value: g.default })) };

        this.setupAutomatons(this.config.iohandlers, this.config.iogates);

        this.router.get("/", (_, res: Response) => {
            res.json(this.config);
        });

        this.router.get("/io", (_, res: Response) => {

            for(const o of this.controllers)
            {
                if(o instanceof ENIPController)
                    o.readGates();
                else if(o instanceof RevolutionPiController)
                    o.readGates();
            }

            res.json(this.config.iogates);
        });

        this.router.get("/revpi", (_, res: Response) => {
            const revpi = this.controllers.find((c): c is RevolutionPiController => c instanceof RevolutionPiController);
            if(!revpi)
            {
                res.status(404).json({ message: "No RevolutionPi controller configured" });
                return;
            }
            res.json(revpi.snapshot());
        });

        this.router.get(`/io/:name`, (req: Request, res: Response) => {
            const name = (req.params.name as string).replace("_", "#");

            const gate = this.config.iogates.find(k => k.name == name);

            res.status(gate !== undefined ? 200 : 404).json(gate);

        });

        this.router.post(`/io/:name/:value`, (req: Request, res: Response) => {

            const name = (req.params.name as string).replace("_", "#");
            const rawValue = req.params.value as string;
            const gate = this.config.iogates.find(k => k.name == name);

            if(gate === undefined)
            {
                res.status(404).end();
                return;
            }

            if(gate.type === "pt100"){
                (gate as SimulationGate).value = parseInt(rawValue) * 10;
            }
            else if(gate.type === "mapped")
            {
                (gate as SimulationGate).value = map(parseFloat(rawValue), gate.mapOutMin, gate.mapOutMax, gate.mapInMin ?? 0, gate.mapInMax ?? 32767);
            }
            else
            {
                (gate as SimulationGate).value = parseInt(rawValue);
            }

            // If the gate belongs to a RevolutionPi controller, mirror the new value into its backing file
            // so Turbine reads the same bytes via REVPI_DEVICE_PATH.
            const owner = this.controllers.find(c => c instanceof RevolutionPiController && c.index === gate.controllerId);
            if(owner instanceof RevolutionPiController)
                owner.writeGate(gate as SimulationGate);

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
    setupAutomatons(controllers: IOHandlers[], gates: SimulationGate[])
    {
        for(const [index, controller] of controllers.entries())
        {
            const controllerGates = gates.filter(k => k.controllerId == index);
            switch(controller.type)
            {
                case "wago": this.controllers.push(new ModbusController(controller, controllerGates, index)); break;
                case "ex260sx": this.controllers.push(new ENIPController(controller, controllerGates, index)); break;
                case "revolutionpi": this.controllers.push(new RevolutionPiController(controller, controllerGates as SimulationGate[], index)); break;
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