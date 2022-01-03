import { Machine } from "../../Machine";
import { Controller } from "../Controller";

import { Request, Response } from "express";
import { IProfileMapper, IProfile, ProfileModel } from "./Profile";

export class ProfileController extends Controller{

    private machine: Machine;

    private profileMap: IProfileMapper = {};

    constructor(machine: Machine)
    {
        super();

        this.machine = machine;

        this._configure();
        this._configureRouter();
    }

    private _configure()
    {
        for(const p of this.machine.specs.profiles)
        {
            this.profileMap[p.identifier] = p;
        }
        return true;
    }
    private _configureRouter()
    {
        /**
         * List available profile maps
         */
         this._router.get('/map', (_req: Request, res: Response) => {
            res.json(Object.keys(this.profileMap));
        });

        this.machine.authManager.registerEndpointPermission("profiles.list", {endpoint: "/v1/profiles/map", method: "get"});

        /**
         * Route to List profiles
         */
        this._router.get('/', async (_req: Request, res: Response) => {
            const profiles = await ProfileModel.find();
            res.json(profiles);
        });

        this.machine.authManager.registerEndpointPermission("profiles.list", {endpoint: "/v1/profiles/", method: "get"});

        /**
         * Route to List profile by identifier
         */
        this._router.get('/:type', async (req: Request, res: Response) => {
            const profiles = await ProfileModel.find({ identifier: req.params.type });

            res.json(profiles);
        });

        this.machine.authManager.registerEndpointPermission("profiles.list", {endpoint: new RegExp("/v1/profiles/.*", "g"), method: "get"});

        /**
         * Route to delete a profile with its given ID
         */
        this._router.delete('/:id', async (req: Request, res: Response) => {
            if(req.params.id != null)
            {
                const profile = await ProfileModel.findById(req.params.id);

                if(profile != undefined)
                {
                    await ProfileModel.findByIdAndDelete(req.params.id);
                    res.status(200).end();
                }
                else
                {
                    res.status(404).end();
                    return;
                }
            }
            else
            {
                res.status(400).end();
                return;
            }
        });

        this.machine.authManager.registerEndpointPermission("profiles.delete", {endpoint: new RegExp("/v1/profiles/.*", "g"), method: "delete"});

        /**
         * Route to copy a profile
         */
        this._router.put('/', async (req: Request, res: Response) => {

            if(req.body.id == "copied")
            {
                delete req.body.id;
                const profile = req.body as IProfile;

                await ProfileModel.create(profile);
                
                res.status(200).end();
                return;
            }
            else
            {
                res.status(400).end();
                return;
            }
        });

        /**
         * Route to create a default profile with the given JSON Structure
         */
        this._router.post('/:type', async (req: Request, res: Response) => {
            const n = this.profileMap[req.params.type];

            n.name = "profile-default-name";

            res.json(await ProfileModel.create(n))
        });
    }

    public async socketData()
    {
        return await ProfileModel.find({});
    }
}