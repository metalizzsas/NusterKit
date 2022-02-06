import { Machine } from "../../Machine";
import { Controller } from "../Controller";

import { Request, Response } from "express";
import { IProfile, ProfileModel } from "./Profile";
import { IProfileExportable, IProfileSkeleton} from "./ProfileSkeleton";

export class ProfileController extends Controller{

    private machine: Machine;

    private profileSkeletons: {[key: string]: IProfileSkeleton} = {};

    private profilePremades: IProfileExportable[] = [];

    constructor(machine: Machine)
    {
        super();

        this.machine = machine;

        this._configure();
        this._configureRouter();
    }

    private async _configure()
    {
        for(const p of this.machine.specs.profiles.skeletons)
        {
            this.profileSkeletons[p.identifier] = p;
        }

        for(const p of this.machine.specs.profiles.premades)
        {
            p.id = "premade_" + p.name;
            this.profilePremades.push(this.convertProfile(p));
        }

        return true;
    }
    private _configureRouter()
    {
        /**
         * List available profile maps
         */
         this._router.get('/skeletons', (_req: Request, res: Response) => {
            res.json(Object.keys(this.profileSkeletons));
        });

        this.machine.authManager.registerEndpointPermission("profiles.list", {endpoint: "/v1/profiles/map", method: "get"});

        /**
         * Route to List profiles
         */
        this._router.get('/', async (_req: Request, res: Response) => {
            const profiles = await ProfileModel.find();

            profiles.map(p => this.convertProfile(p));

            res.json([...profiles, ...this.profilePremades]);
        });

        this.machine.authManager.registerEndpointPermission("profiles.list", {endpoint: "/v1/profiles/", method: "get"});

        /**
         * Route to List profile by identifier
         */
        this._router.get('/type/:type', async (req: Request, res: Response) => {
            const profiles = await ProfileModel.find({ identifier: req.params.type });

            res.json(profiles);
        });

        this.machine.authManager.registerEndpointPermission("profiles.list", {endpoint: new RegExp("/v1/profiles/.*", "g"), method: "get"});

        this._router.get('/:id', async (req: Request, res: Response) => {

            if(req.params.id.startsWith("premade_"))
            {
                const profile = this.profilePremades.find(p => p.name === req.params.id.split("_")[1]);
                if(profile)
                {
                    res.json(profile);
                }
                else
                {
                    res.status(404).json("Profile not found");
                }
            }
            else
            {
                const profile = await ProfileModel.findById(req.params.id);
    
                res.status(profile ? 200 : 404);
    
                if(profile)
                    res.json(this.convertProfile(profile));
                else
                    res.end();
            }
        });

        /**
         * Route to create a default profile with the given JSON Structure
         */
         this._router.post('/create/:type', async (req: Request, res: Response) => {
            const p: IProfile = {
                name: "profile-default-name",
                skeleton: req.params.type,
                modificationDate: Date.now(),
                overwriteable: true,
                removable: true,
                values: {}
            };

            const newp = await ProfileModel.create(p);

            res.json(this.convertProfile(newp));
        });

        this._router.post('/', async (req: Request, res: Response) => {

            if(req.body.id.startsWith("premade_"))
            {
                res.status(403).write("cant edit premade profiles");
                return;
            }

            const p: IProfileExportable = req.body;

            p.modificationDate = Date.now();

            const profile = this.retreiveProfile(p);
            
            await ProfileModel.findByIdAndUpdate(profile.id, profile);
            res.status(200).end();
        });

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
                const profile = req.body as IProfileExportable;
                profile.modificationDate = Date.now();

                const copied = this.retreiveProfile(profile);

                await ProfileModel.create(copied);
                
                res.status(200).end();
                return;
            }
            else
            {
                res.status(400).end();
                return;
            }
        });
    }

    public convertProfile(profile: IProfile): IProfileExportable
    {
        const skeleton = this.profileSkeletons[profile.skeleton];

        const exportable: IProfileExportable = {...skeleton, ...{
            id: profile.id,
            name: profile.name,
            modificationDate: profile.modificationDate || Date.now(),
            removable: profile.removable,
            overwriteable: profile.overwriteable
        }};

        for(const fg of exportable.fieldGroups)
        {
            for(const f of fg.fields)
            {
                f.value = profile.values[fg.name + "#" + f.name] || f.value;
            }
        }

        return exportable;
    }

    public retreiveProfile(profileexp: IProfileExportable): IProfile
    {
        const profile: IProfile = {
            id: profileexp.id,
            skeleton: profileexp.identifier,
            name: profileexp.name,
            modificationDate: profileexp.modificationDate,
            removable: profileexp.removable,
            overwriteable: profileexp.overwriteable,
            values: {}
        };

        for(const fg of profileexp.fieldGroups)
        {
            for(const f of fg.fields)
            {
                profile.values[fg.name + "#" + f.name] = f.value;
            }
        }

        return profile;
    }

    public getPremade(id: string): IProfileExportable | undefined
    {
        return this.profilePremades.find(p => p.id === id);
    }

    public async socketData()
    {
        const list = await ProfileModel.find({}); 
        return [...list.map(p => this.convertProfile(p)), ...this.profilePremades]
    }
}