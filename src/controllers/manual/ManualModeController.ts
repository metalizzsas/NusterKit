import { Machine } from "../../Machine";
import { Controller } from "../Controller";
import { ManualMode } from "./ManualMode";

import { Request, Response } from "express";

export class ManualModeController extends Controller
{
    private machine: Machine

    manualModes: ManualMode[] = []

    constructor(machine: Machine)
    {
        super();
        this.machine = machine;

        this._configure();
        this._configureRouter();
    }

    private async _configure()
    {
        this.manualModes = this.machine.specs.manual.map(m => new ManualMode(m, this.machine));
    }

    private _configureRouter()
    {
        this._router.get('/', async (req: Request, res: Response) => {
            res.json(this.socketData);
        });

        this.machine.authManager.registerEndpointPermission("manual.list", {endpoint: "/v1/manual/", method: "get"});

        this.router.post('/:name/:value', async (req: Request, res: Response) => {

            const mode = this.manualModes.find(k => k.name === req.params.name);

            //find manual mode to update
            if(mode)
            {
                if(mode.locked)
                {
                    res.status(403);
                    res.write("locked");
                    res.end();
                    return;
                }
                else
                {
                    const result = await mode.toggle(parseInt(req.params.value));
    
                    res.status(result ? 200 : 403);
                    res.write(result ? "ok" : "error");
                    res.end();
                    return;
                }
            }
            else
            {
                res.status(404);
                res.write("manual mode not found");
                res.end();
                return;
            }
        });

        this.machine.authManager.registerEndpointPermission("manual.toggle", {endpoint: new RegExp("/v1/manual/.*/.*", "g"), method: "post"});
    }

    public get socketData()
    {
        return this.manualModes.filter(k => !this.machine.settings.maskedManuals.includes(k.name));
    }

    find(name: string): ManualMode | undefined
    {
        return this.manualModes.find(m => m.name = name);
    }
}