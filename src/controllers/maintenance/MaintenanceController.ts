import { Maintenance } from "./Maintenance";
import { Machine } from "../../Machine";

import { Request, Response } from "express";
import { Controller } from "../Controller";

export class MaintenanceController extends Controller
{

    private tasks: Maintenance[] = []
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
        for(const maintenance of this.machine.specs.maintenance)
        {
            this.tasks.push(new Maintenance(maintenance.name, maintenance.durationType, maintenance.durationLimit, maintenance.procedure));
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
    }

    public async socketData(): Promise<Maintenance[]>
    {
        for(const t of this.tasks)
            await t.refresh();

        return this.tasks;
    }
}