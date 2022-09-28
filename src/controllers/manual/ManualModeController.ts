import { Controller } from "../Controller";
import { ManualMode } from "./ManualMode";

import { Request, Response } from "express";
import { AuthManager } from "../../auth/auth";
import { IManualMode } from "../../interfaces/IManualMode";

export class ManualModeController extends Controller
{
    manualModes: ManualMode[] = [];

    maskedManuals: string[];

    private static _instance: ManualModeController;

    private constructor(manuals: IManualMode[], maskedManuals: string[] = [])
    {
        super();

        this.manualModes = manuals.map(m => new ManualMode(m));
        this.maskedManuals = maskedManuals;

        this._configureRouter();
    }

    static getInstance(manuals?: IManualMode[], maskedManuals?: string[])
    {
        if(!this._instance)
            if(manuals !== undefined)
                this._instance = new ManualModeController(manuals, maskedManuals);
            else
                throw new Error("ManualController: Failed to instantiate, missing data");

        return this._instance;
    }

    private _configureRouter()
    {
        this._router.get('/', async (req: Request, res: Response) => {
            res.json(this.socketData);
        });

        AuthManager.getInstance().registerEndpointPermission("manual.list", {endpoint: "/v1/manual/", method: "get"});

        this.router.post('/:name/:value', async (req: Request, res: Response) => {

            const name = req.params.name.replace("_", "#"); 

            const mode = this.manualModes.find(k => k.name === name);

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

        AuthManager.getInstance().registerEndpointPermission("manual.toggle", {endpoint: new RegExp("/v1/manual/.*/.*", "g"), method: "post"});
    }

    public get socketData()
    {
        return this.manualModes.filter(k => !this.maskedManuals.includes(k.name));
    }

    find(name: string): ManualMode | undefined
    {
        return this.manualModes.find(m => m.name == name);
    }
}