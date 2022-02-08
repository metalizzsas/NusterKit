import { Machine } from "../../Machine";
import { Controller } from "../Controller";

import { Request, Response } from "express";
import { IProfile, ProfileModel } from "./Profile";
import { IProfileExportable, IProfileSkeleton} from "./ProfileSkeleton";
import { Types } from "mongoose";

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
            const k: IProfile = {...p, values: new Map<string, number>()};
            k.values = new Map(Object.entries(p.values));

            this.profilePremades.push(this.convertProfile(k));
        }

        return true;
    }
    private _configureRouter()
    {
        /**
         * List available profile maps
         */
        this.machine.authManager.registerEndpointPermission("profiles.list", {endpoint: "/v1/profiles/skeletons", method: "get"});
        this._router.get('/skeletons', (_req: Request, res: Response) => {
            res.json(Object.keys(this.profileSkeletons));
        });

        /**
         * Route to List profiles
         */
        this.machine.authManager.registerEndpointPermission("profiles.list", {endpoint: "/v1/profiles/", method: "get"});
        this._router.get('/', async (_req: Request, res: Response) => {
            const profiles = await ProfileModel.find();

            profiles.map(p => this.convertProfile(p));

            res.json([...profiles, ...this.profilePremades]);
        });

        /**
         * Route to List profile by identifier
         */
        this.machine.authManager.registerEndpointPermission("profiles.list", {endpoint: new RegExp("/v1/profiles/types/.*", "g"), method: "get"});
        this._router.get('/type/:type', async (req: Request, res: Response) => {
            const profiles = await ProfileModel.find({ identifier: req.params.type });

            res.json(profiles);
        });

        this.machine.authManager.registerEndpointPermission("profiles.list", {endpoint: new RegExp("/v1/profiles/.*", "g"), method: "get"});
        this._router.get('/:id', async (req: Request, res: Response) => {
            if(req.params.id.startsWith("premade_"))
            {
                const profile = this.profilePremades.find(p => p.name === req.params.id.split("_")[1]);
                (profile) ? res.json(profile) : res.status(404).json({error: "Profile not found"});
            }
            else
            {
                const profile = await ProfileModel.findById(req.params.id);
                res.status(profile ? 200 : 404);
    
                (profile) ? res.json(this.convertProfile(profile)) : res.end();
            }
        });

        /**
         * Route to create a default profile with the given JSON Structure
         */
         this.machine.authManager.registerEndpointPermission("profile.create", {endpoint: new RegExp("/v1/profiles/create/.*", "g"), method: "post"});
         this._router.post('/create/:type', async (req: Request, res: Response) => {
             const newp = await ProfileModel.create({
                 name: "profile-default-name",
                 skeleton: req.params.type,
                 modificationDate: Date.now(),
                 overwriteable: true,
                 removable: true,
                 values: {}
             });
             res.json(this.convertProfile(newp));
        });

        this.machine.authManager.registerEndpointPermission("profile.edit", {endpoint: "/v1/profiles/", method: "post"});
        this._router.post('/', async (req: Request, res: Response) => {

            if(req.body.id.startsWith("premade_"))
            {
                res.status(403).write("cant edit premade profiles");
                return;
            }

            const p: IProfileExportable & {id: Types.ObjectId} = req.body;

            p.modificationDate = Date.now();

            const profile = this.retreiveProfile(p);
            
            await ProfileModel.findByIdAndUpdate(profile.id, profile);
            res.status(200).end();
        });

        this.machine.authManager.registerEndpointPermission("profiles.delete", {endpoint: new RegExp("/v1/profiles/.*", "g"), method: "delete"});
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

        this.machine.authManager.registerEndpointPermission("profiles.create", {endpoint: "/v1/profiles/", method: "put"});
        this._router.put('/', async (req: Request, res: Response) => {

            if(req.body.id == "copied")
            {
                delete req.body.id;
                const profile = req.body as IProfileExportable;
                profile.modificationDate = Date.now();
                profile.overwriteable = true;
                profile.removable = true;

                const copied = this.retreiveProfile(profile);

                res.status(200).json(await ProfileModel.create(copied));
                return;
            }
            else
            {
                res.status(400).end();
                return;
            }
        });
    }

    public convertProfile(profile: IProfile & {id?: Types.ObjectId}): IProfileExportable
    {
        const skeleton = this.profileSkeletons[profile.skeleton];

        const exportable: IProfileExportable = {
            ...skeleton, ...{
                id: profile.id,
                name: profile.name,
                modificationDate: profile.modificationDate || Date.now(),
                removable: profile.removable,
                overwriteable: profile.overwriteable,
                isPremade: (profile.id === undefined)
            }
        };

        for(const fg of exportable.fieldGroups)
        {
            for(const f of fg.fields)
            {
                f.value = profile.values.get(fg.name + "#" + f.name) ?? f.value;
            }
        }

        return exportable;
    }

    public retreiveProfile(profileexp: IProfileExportable & {id?: Types.ObjectId}): IProfile
    {
        const profile: IProfile = {
            id: (!profileexp.isPremade ?? false) ? profileexp.id : undefined,
            skeleton: profileexp.identifier,
            name: profileexp.name,
            modificationDate: profileexp.modificationDate,
            removable: (!profileexp.isPremade) ? profileexp.removable : true,
            overwriteable: (!profileexp.isPremade) ? profileexp.overwriteable : true,
            isPremade: profileexp.isPremade,
            values: new Map<string, number>()
        };

        profileexp.fieldGroups.flatMap((f) => f.fields.flatMap(f2 => profile.values.set(f.name + "#" + f2.name, f2.value)));

        return profile;
    }

    public getPremade(id: string): IProfileExportable | undefined
    {
        return this.profilePremades.find(p => p.name === id);
    }

    public async socketData()
    {
        const list = await ProfileModel.find({}); 
        return [...list.map(p => this.convertProfile(p)), ...this.profilePremades]
    }
}