import { Controller } from "../Controller";
import { Passive } from "./Passive";
import { Request, Response } from "express";
import { AuthManager } from "../../auth/auth";
import { IPassive, ISocketPassive } from "../../interfaces/IPassive";

export class PassiveController extends Controller
{
    passives: Passive[] = [];

    private static _instance: PassiveController;

    private constructor(passives: IPassive[])
    {
        super();

        for(const passive of passives)
        {
            this.passives.push(new Passive(passive));
        }

        this._configureRouter();
    }

    static getInstance(passives?: IPassive[])
    {
        if(!this._instance)
            if(passives !== undefined)
                this._instance = new PassiveController(passives);
            else
                throw new Error("SlotsController: Failed to instantiate, missing data");

        return this._instance;
    }

    private async _configureRouter()
    {
        this._router.get("/", (req: Request, res: Response) => {
            res.json(this.passives);
        });

        AuthManager.getInstance().registerEndpointPermission("passives.list", {endpoint: "/v1/passives/", method: "get"});

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

        AuthManager.getInstance().registerEndpointPermission("passives.toggle", {endpoint: new RegExp("/v1/passives/.*/.*/.*", "g"), method: "post"});
    }

    find(name: string): Passive | undefined
    {
        return this.passives.find(c => c.name == name);
    }

    public get socketData(): ISocketPassive[]
    {
        return this.passives.filter(p => p.internal !== true).map(p => p.toJSON());
    }
}