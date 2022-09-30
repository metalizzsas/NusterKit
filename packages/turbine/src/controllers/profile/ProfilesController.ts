import { Controller } from "../Controller";

import { Request, Response } from "express";
import { ObjectId } from "mongoose";
import { LoggerInstance } from "../../app";
import { AuthManager } from "../../auth/auth";
import { ProfileModel } from "./ProfileModel";
import { IProfileExportable } from "@metalizzsas/nuster-typings/build/exchanged/profile";
import { IProfile, IProfileSkeleton, IConfigProfile } from "@metalizzsas/nuster-typings/build/spec/profile";

export type IProfileMap = Omit<IProfile, 'values'> & { values: Map<string, number | boolean>};

export class ProfileController extends Controller {

    private profileSkeletons: Map<string, IProfileSkeleton> = new Map<string, IProfileSkeleton>();
    private profilePremades: IProfileExportable[] = [];

    private maskedProfiles: string[];
    
    static _instance: ProfileController;

    private constructor(profileSkeletons: IProfileSkeleton[], profilePremades: IConfigProfile[], maskedProfiles: string[] = [])
    {
        super();

        this.maskedProfiles = maskedProfiles;

        this._configure(profileSkeletons, profilePremades);
        this._configureRouter();
    }

    static getInstance(profileSkeletons?: IProfileSkeleton[], profilePremades?: IConfigProfile[], maskedProfiles?: string[])
    {
        if(!this._instance)
            if(profileSkeletons !== undefined && profilePremades !== undefined)
                this._instance = new ProfileController(profileSkeletons, profilePremades, maskedProfiles);
            else
                throw new Error("ProfileController: Failed to instantiate, no data given");

        return this._instance;
    }

    private async _configure(profileSkeletons: IProfileSkeleton[], profilePremades: IConfigProfile[])
    {
        for(const p of profileSkeletons)
        {
            this.profileSkeletons.set(p.identifier, structuredClone(p));
        }
        
        for(const p of profilePremades)
        {
            //mask profile if it is masked on machine settings
            if(this.maskedProfiles.includes(p.name))
            {
                LoggerInstance.info(`Skipping premade profile ${p.name} because it is masked on machine settings.`);
            }
            else
            {

                //Converting profile.values from Object to Map
                const values = (p.values as unknown as ({[x: string]:number}));

                const k: IProfileMap = {...p, values: new Map<string, number>(Object.entries(values))};
    
                const converted = structuredClone(this.convertProfile(k));
    
                this.profilePremades.push(converted);
            }
        }
        return true;
    }
    private _configureRouter()
    {
        /**
         * List available profile maps
         */
        AuthManager.getInstance().registerEndpointPermission("profiles.list", {endpoint: "/v1/profiles/skeletons", method: "get"});
        this._router.get('/skeletons', (_req: Request, res: Response) => {
            res.json([...this.profileSkeletons.keys()]);
        });

        AuthManager.getInstance().registerEndpointPermission("profiles.list", {endpoint: new RegExp("/v1/profiles/skeletons/.*", "g"), method: "get"});
        this.router.get('/skeletons/:name', (req: Request, res: Response) => {
            res.json(this.profileSkeletons.get(req.params.name));
        });

        /**
         * Route to List profiles
         */
        AuthManager.getInstance().registerEndpointPermission("profiles.list", {endpoint: "/v1/profiles/", method: "get"});
        this._router.get('/', async (_req: Request, res: Response) => {

            const profiles = await ProfileModel.find();

            res.json([...profiles.map(p => this.convertProfile(p)), ...this.profilePremades]);
        });

        /**
         * Route to List profile by identifier
         */
        AuthManager.getInstance().registerEndpointPermission("profiles.list", {endpoint: new RegExp("/v1/profiles/types/.*", "g"), method: "get"});
        this._router.get('/type/:type', async (req: Request, res: Response) => {
            const profiles = await ProfileModel.find({ identifier: req.params.type });

            res.json(profiles);
        });

        AuthManager.getInstance().registerEndpointPermission("profiles.list", {endpoint: new RegExp("/v1/profiles/.*", "g"), method: "get"});
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
         AuthManager.getInstance().registerEndpointPermission("profile.create", {endpoint: new RegExp("/v1/profiles/create/.*", "g"), method: "post"});
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

        /**
         * Route to create a profile from given body
         */
         AuthManager.getInstance().registerEndpointPermission("profile.create", {endpoint: new RegExp("/v1/profiles/create/", "g"), method: "post"});
         this._router.put('/create/', async (req: Request, res: Response) => {

            if(req.body.id == "created")
            {
                delete req.body.id;
                const profile = req.body as IProfileExportable;
                profile.modificationDate = Date.now();
                profile.overwriteable = true;
                profile.removable = true;
                profile.isPremade = false;

                const created = this.retreiveProfile(profile);

                res.status(200).json(await ProfileModel.create(created));
                return;
            }
            else
            {
                res.status(400).end();
                return;
            }
        });

        AuthManager.getInstance().registerEndpointPermission("profile.edit", {endpoint: "/v1/profiles/", method: "post"});
        this._router.post('/', async (req: Request, res: Response) => {

            if(req.body.id.startsWith("premade_"))
            {
                res.status(403).write("cant edit premade profiles");
                return;
            }

            const p: IProfileExportable & {id: ObjectId} = req.body;

            p.modificationDate = Date.now();

            const profile = this.retreiveProfile(p);
            
            ProfileModel.findByIdAndUpdate(profile.id, profile, {}, (err) => {

                if(err)
                    res.status(402).end("not ok");
                else
                    res.status(200).end("ok");
            });
        });

        AuthManager.getInstance().registerEndpointPermission("profiles.delete", {endpoint: new RegExp("/v1/profiles/.*", "g"), method: "delete"});
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

        AuthManager.getInstance().registerEndpointPermission("profiles.create", {endpoint: "/v1/profiles/", method: "put"});
        this._router.put('/', async (req: Request, res: Response) => {

            if(req.body.id == "copied")
            {
                delete req.body.id;
                const profile = req.body as IProfileExportable;
                profile.modificationDate = Date.now();
                profile.overwriteable = true;
                profile.removable = true;
                profile.isPremade = false;

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

    public convertProfile(profile: IProfileMap & {id?: ObjectId}): IProfileExportable
    {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const skeleton = structuredClone(this.profileSkeletons.get(profile.skeleton)!); // avoid skeleton modifications

        const exportable: IProfileExportable = {
            ...skeleton, ...{
                id: profile.id,
                name: profile.name,
                modificationDate: profile.modificationDate || Date.now(),
                removable: profile.removable,
                overwriteable: profile.overwriteable,
                isPremade: profile.isPremade
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

    public retreiveProfile(profileexp: IProfileExportable & {id?: ObjectId}): IProfileMap & {id?: ObjectId}
    {
        const profile: IProfileMap & {id?: ObjectId} = {
            id: (!profileexp.isPremade ?? false) ? profileexp.id : undefined,
            skeleton: profileexp.identifier,
            name: profileexp.name,
            modificationDate: profileexp.modificationDate,
            removable: (!profileexp.isPremade) ? profileexp.removable : true,
            overwriteable: (!profileexp.isPremade) ? profileexp.overwriteable : true,
            isPremade: profileexp.isPremade,
            values: new Map<string, number>()
        };

        for(const fg of profileexp.fieldGroups)
        {
            for(const f of fg.fields)
            {
                profile.values.set(fg.name + "#" + f.name, f.value);
            }
        }

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