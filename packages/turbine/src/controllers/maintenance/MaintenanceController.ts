import type { IMaintenanceHydrated } from "@metalizzsas/nuster-typings/build/hydrated/maintenance";
import type { IConfigMaintenance } from "@metalizzsas/nuster-typings/build/spec/maintenance";
import type { ICountableMaintenance } from "@metalizzsas/nuster-typings/build/spec/maintenance/CountableMaintenance";
import type { ISensorMaintenance } from "@metalizzsas/nuster-typings/build/spec/maintenance/SensorMaintenance";
import type { NextFunction, Request, Response } from "express";

import { AuthManager } from "../../auth/auth";
import { Controller } from "../Controller";
import { CountableMaintenance } from "./CountableMaintenance";
import { SensorMaintenance } from "./SensorMaintenance";

export class MaintenanceController extends Controller
{
    public tasks: (CountableMaintenance | SensorMaintenance)[] = []

    private static _instance: MaintenanceController;

    /** Express Handler to check if passed maintenance task exists */
    maintenanceTaskExists = (req: Request, res: Response, next: NextFunction) =>
    {
        if(!this.tasks.map(k => k.name).includes(req.params.name))
            res.send(404).end("Maintenance task not found");
        else
            next();
    }

    private constructor(maintenanceTasks: IConfigMaintenance[])
    {
        super()

        this._configureRouter();
        this._configure(maintenanceTasks);
    }

    static getInstance(maintenanceTasks?: IConfigMaintenance[])
    {
        if(!this._instance)
            if(maintenanceTasks !== undefined)
                this._instance = new MaintenanceController(maintenanceTasks);
            else
                throw new Error("MaintenanceController: Failed to instantiate, no data given.");

        return this._instance;
    }

    private async _configure(maintenanceTasks: IConfigMaintenance[])
    {
        for(const task of [...maintenanceTasks, {name: "cycleCount", durationType: 'cycle', durationLimit: Number.MAX_VALUE} as ICountableMaintenance])
        {
            switch(task.durationType)
            {
                case "sensor": this.tasks.push(new SensorMaintenance(task as ISensorMaintenance)); break;
                default: this.tasks.push(new CountableMaintenance(task));
            }
        }
    }

    private _configureRouter()
    {
        this._router.get("/", async (_req: Request, res: Response) => {
            res.json(this.tasks);
        });

        AuthManager.getInstance().registerEndpointPermission("maintenance.list", {endpoint: "/v1/maintenance/", method: "get"});


        this._router.get("/:name", this.maintenanceTaskExists, (req: Request, res: Response) => {
            const maintenance = this.tasks.find(task => task.name == req.params.name);
            res.json(maintenance);
        });

        AuthManager.getInstance().registerEndpointPermission("maintenance.list", {endpoint: new RegExp("/v1/maintenance/.*/procedure", "g"), method: "get"});

        this._router.get("/:name/procedure", this.maintenanceTaskExists, async (req: Request, res: Response) => {
            const maintenance = this.tasks.find(t => t.name == req.params.name);
            res.json(maintenance?.procedure);
        });

        AuthManager.getInstance().registerEndpointPermission("maintenance.list", {endpoint: new RegExp("/v1/maintenance/.*", "g"), method: "get"});

        this._router.delete("/:name", this.maintenanceTaskExists, async (req: Request, res: Response) => {

            const maintenance = this.tasks.find(t => t.name == req.params.name);
            maintenance?.reset();

            res.status(200).end()
        });

        AuthManager.getInstance().registerEndpointPermission("maintenance.reset", {endpoint: new RegExp("/v1/maintenance/.*", "g"), method: "delete"});
    }

    public socketData(): IMaintenanceHydrated[]
    {
        return this.tasks.map(k => k.toJSON());
    }
}