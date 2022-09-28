import { Maintenance } from "./Maintenance";
import { Machine } from "../../Machine";

import { Request, Response } from "express";
import { Controller } from "../Controller";
import { IConfigMaintenance } from "../../interfaces/IMaintenance";
import { AuthManager } from "../../auth/auth";

export class MaintenanceController extends Controller
{
    public tasks: Maintenance[] = []
    private machine: Machine

    constructor(machine: Machine)
    {
        super()
        this.machine = machine;

        this._configureRouter();
        this._configure();
    }

    private async _configure()
    {
        for(const maintenance of [...this.machine.specs.maintenance, {name: "cycleCount", durationType: 'cycle', durationLimit: Number.MAX_VALUE} as IConfigMaintenance])
        {
            this.tasks.push(new Maintenance(maintenance, this.machine.logger));
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

    public async socketData(): Promise<Maintenance[]>
    {
        for(const t of this.tasks)
            await t.refresh();

        return this.tasks;
    }
}