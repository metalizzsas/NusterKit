import { Maintenance } from "../models/Maintenance";
import { Machine } from "../classes/Machine";

import path from "path";
import fs from "fs";
import { Request, Response, NextFunction, Router } from "express";

export class MaintenanceController
{

    private tasks: Maintenance[] = []
    private _router = Router();
    private machine: Machine

    constructor(machine: Machine)
    {
        this.machine = machine;

        this._configureRouter();
        this._configure();
    }

    get router()
    {
        return this._router;
    }

    private async _configure()
    {
        let raw = fs.readFileSync(path.resolve("specs", this.machine.model, this.machine.variant, this.machine.revision + ".json"), {encoding: "utf-8"});
    
        let json = JSON.parse(raw).maintenance;

        for(let maintenance of json)
        {
            this.tasks.push(new Maintenance(maintenance.name, maintenance.durationType, maintenance.durationLimit, maintenance.procedure));
        }
    }

    private _configureRouter()
    {
        this._router.get("/", async (req: Request, res: Response) => {
            for(let [index, maintenance] of this.tasks.entries())
            {
                await this.tasks[index].refresh();
            }

            res.status(200).json(this.tasks);
        });

        this._router.put("/:name", async (req: Request, res: Response) => {
            for(let [index, maintenance] of this.tasks.entries())
            {
                if(maintenance.name == req.params.name)
                {
                    await this.tasks[index].reset();

                    res.status(200).end();
                    return;
                }
            }
            res.status(404).end();
        });
    }
}