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
            this.passives.push(new Passive(this.machine, p));
        }

        this._configureRouter();
    }

    private async _configureRouter()
    {
        this._router.get("/", (req: Request, res: Response) => {
            res.json(this.passives);
        });

        this.machine.authManager.registerEndpointPermission("passives.list", {endpoint: "/v1/passives/", method: "get"});

        /*
            This route change Passive mode state
        */
        this._router.post("/:passive/state/:state", (req: Request, res: Response) => {
            
            const passive = this.passives.find((p) => p.name == req.params.passive);

            if(passive)
            {
                passive.toggle(req.params.state == "true" ? true : false);
                res.status(200)
                res.end();
            }
            else
            {
                res.status(404)
                res.write("Could not find a passive with this name");
                res.end();
            }
        });

        /*
            This route change passive mode target
        */
        this._router.post("/:passive/target/:target", (req: Request, res: Response) => {
            const passive = this.passives.find(p => p.name == req.params.passive);

            if(passive)
            {
                passive.setTarget(parseFloat(req.params.target));
                res.status(200);
                res.end();
            }
            else
            {
                res.status(404)
                res.write("could not find passive to change target to");
                res.end();
            }
        });

        this.machine.authManager.registerEndpointPermission("passives.toggle", {endpoint: new RegExp("/v1/passives/.*/.*/.*", "g"), method: "post"});
    }

    find(name: string): Passive | undefined
    {
        return this.passives.find(c => c.name == name);
    }

    public get socketData()
    {
        return this.passives;
    }
}