import type { NextFunction, Request, Response } from "express";
import { Router } from "./Router";

import type { MaintenanceHydrated } from "../types/hydrated/maintenance";
import type { Maintenances } from "../types/spec/maintenances";

import { CountableMaintenance } from "../maintenance/CountableMaintenance";
import { SensorMaintenance } from "../maintenance/SensorMaintenance";

export class MaintenanceRouter extends Router
{
    public tasks: (CountableMaintenance | SensorMaintenance)[] = []

    constructor(maintenanceTasks: Maintenances[])
    {
        super();

        this._configureRouter();
        
        const tasks: Array<Maintenances> = [...maintenanceTasks, { name: "cycleCount", durationType: 'cycle', durationLimit: Number.MAX_VALUE }];

        for(const task of tasks)
        {
            switch(task.durationType)
            {
                case "sensor": this.tasks.push(new SensorMaintenance(task)); break;
                default: this.tasks.push(new CountableMaintenance(task)); break;
            }
        }
    }

    /** Express Handler to check if passed maintenance task exists */
    private maintenanceTaskExists = (req: Request, res: Response, next: NextFunction) =>
    {
        if(!this.tasks.map(k => k.name).includes(req.params.name))
            res.send(404).end("Maintenance task not found");
        else
            next();
    }

    private _configureRouter()
    {
        this.router.get("/", async (_req: Request, res: Response) => {
            res.json(this.tasks);
        });

        this.router.get("/:name", this.maintenanceTaskExists, (req: Request, res: Response) => {
            const maintenance = this.tasks.find(task => task.name == req.params.name);
            res.json(maintenance);
        });

        this.router.delete("/:name", this.maintenanceTaskExists, async (req: Request, res: Response) => {

            const maintenance = this.tasks.find(t => t.name == req.params.name);
            maintenance?.reset();

            res.status(200).end()
        });
    }

    public socketData(): MaintenanceHydrated[]
    {
        return this.tasks.map(k => k.toJSON());
    }
}