import { Request, Response } from "express";

import { Maintenance } from "./Maintenance";
import { Controller } from "../Controller";
import { IConfigMaintenance, ISocketMaintenance } from "../../interfaces/IMaintenance";
import { AuthManager } from "../../auth/auth";

export class MaintenanceController extends Controller
{
    public tasks: Maintenance[] = []

    private static _instance: MaintenanceController;

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
        for(const task of [...maintenanceTasks, {name: "cycleCount", durationType: 'cycle', durationLimit: Number.MAX_VALUE} as IConfigMaintenance])
        {
            this.tasks.push(new Maintenance(task));
        }
    }

    private _configureRouter()
    {
        this._router.get("/", async (req: Request, res: Response) => {
            for(const [index] of this.tasks.entries())
            {
                await this.tasks[index].refresh();
            }

            res.status(200).json(this.tasks);
        });

        AuthManager.getInstance().registerEndpointPermission("maintenance.list", {endpoint: "/v1/maintenance/", method: "get"});


        this._router.get("/:name", async (req: Request, res: Response) => {
            const maintenance = this.tasks.find(task => task.name == req.params.name);

            if(maintenance)
            {
                res.json(maintenance);
            }
            else
            {
                res.status(404).end("not found");
            }
        });

        AuthManager.getInstance().registerEndpointPermission("maintenance.list", {endpoint: new RegExp("/v1/maintenance/.*", "g"), method: "get"});

        this._router.delete("/:name", async (req: Request, res: Response) => {
            for(const [index, maintenance] of this.tasks.entries())
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

        AuthManager.getInstance().registerEndpointPermission("maintenance.reset", {endpoint: new RegExp("/v1/maintenance/.*", "g"), method: "delete"});
    }

    public async socketData(): Promise<ISocketMaintenance[]>
    {
        for(const t of this.tasks)
            await t.refresh();

        return this.tasks.map(t => t.toJSON());
    }
}