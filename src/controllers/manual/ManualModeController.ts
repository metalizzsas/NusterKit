import { Machine } from "../../Machine";
import { Controller } from "../Controller";
import { ManualMode } from "./ManualMode";

import { Request, Response } from "express";

export class ManualModeController extends Controller
{
    private machine: Machine

    keys: ManualMode[] = []

    constructor(machine: Machine)
    {
        super();
        this.machine = machine;

        this._configure();
        this._configureRouter();
    }

    private async _configure()
    {
        this.keys = this.machine.specs.manual.map(m => new ManualMode(m, this.machine));
    }

    private _configureRouter()
    {
        this._router.get('/', async (req: Request, res: Response) => {
            res.json(this.keys);
        });

        this.machine.authManager.registerEndpointPermission("manual.list", {endpoint: "/v1/manual/", method: "get"});

        this.router.post('/:name/:value', async (req: Request, res: Response) => {
            
            const key = this.keys.find(k => k.name === req.params.name);

            //find manual mode to update
            if(key)
            {
                const result = await key.toggle(parseInt(req.params.value));

                res.status(result ? 200 : 403).write(result ? "ok" : "error");
                return;
            }
            else
            {
                res.status(404).write("manual mode not found");
                return;
            }
        });

        this.machine.authManager.registerEndpointPermission("manual.toggle", {endpoint: new RegExp("/v1/manual/.*/.*", "g"), method: "post"});
    }

    public get socketData()
    {
        return this.keys;
    }
}