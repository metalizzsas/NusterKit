import { Machine } from "../../Machine";
import { Controller } from "../Controller";
import { Passive } from "./Passive";
import { Request, Response } from "express";

export class PassiveController extends Controller
{
    machine: Machine;
    passives: Passive[] = [];

    constructor(machine: Machine)
    {
        super();
        this.machine = machine;

        for(const p of this.machine.specs.passives)
        {
            this.passives.push(new Passive(this.machine.ioController, p));
        }

        this._configureRouter();
    }

    private async _configureRouter()
    {
        this._router.get("/", (req: Request, res: Response) => {
            res.json(this.passives);
        });

        this._router.post("/:passive/:state", (req: Request, res: Response) => {
            
            const passive = this.passives.findIndex((p) => p.name == req.params.passive);

            if(passive > -1)
            {
                this.passives[passive].isEnabled = (req.params.state == "true")
                res.status(200).end();
                return;
            }
            else
            {
                res.status(404).write("Could not find a passive with this name");
            }
        });
    }

    public get socketData()
    {
        return this.passives;
    }
}