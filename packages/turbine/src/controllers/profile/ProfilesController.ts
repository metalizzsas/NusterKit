import { Controller } from "../Controller";

import { Request, Response } from "express";
import { LoggerInstance } from "../../app";
import { AuthManager } from "../../auth/auth";
import { ProfileModel } from "./ProfileModel";

import type { IProfileSkeleton, ProfileSkeletonFields, IProfileConfig } from "@metalizzsas/nuster-typings/src/spec/profile";
import type { IProfileHydrated, IProfileStored } from "@metalizzsas/nuster-typings/src/hydrated/profile";

export class ProfileController extends Controller {

    private profileSkeletons: Map<string, IProfileSkeleton> = new Map<string, IProfileSkeleton>();
    private profilePremades: IProfileHydrated[] = [];

    private maskedProfiles: string[];
    
    static _instance: ProfileController;

    private constructor(profileSkeletons: IProfileSkeleton[], profilePremades: IProfileConfig[], maskedProfiles: string[] = [])
    {
        super();

        this.maskedProfiles = maskedProfiles;

        this._configure(profileSkeletons, profilePremades);
        this._configureRouter();
    }

    static getInstance(profileSkeletons?: IProfileSkeleton[], profilePremades?: IProfileConfig[], maskedProfiles?: string[])
    {
        if(!this._instance)
            if(profileSkeletons !== undefined && profilePremades !== undefined)
                this._instance = new ProfileController(profileSkeletons, profilePremades, maskedProfiles);
            else
                throw new Error("ProfileController: Failed to instantiate, no data given");

        return this._instance;
    }

    private async _configure(profileSkeletons: IProfileSkeleton[], profilePremades: IProfileConfig[])
    {
        for(const skeleton of profileSkeletons)
        {
            this.profileSkeletons.set(skeleton.name, structuredClone(skeleton));
        }
        
        for(const p of profilePremades)
        {
            //mask profile if it is masked on machine settings
            if(this.maskedProfiles.includes(p.name))
                LoggerInstance.info(`Skipping premade profile ${p.name} because it is masked on machine settings.`);
            else
            {
                const converted = this.hydrateProfile(p);

                if(converted !== undefined)
                {
                    this.profilePremades.push(converted);
                }
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
            res.json(await this.socketData());
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
                const profile = this.getPremade(req.params.id.split("_")[1]);
                (profile) ? res.json(profile) : res.status(404).json({error: "Profile not found"});
            }
            else
            {
                const profile = await ProfileModel.findById(req.params.id);
                res.status(profile ? 200 : 404);
    
                (profile) ? res.json(this.hydrateProfile(profile)) : res.end();
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
             res.json(this.hydrateProfile(newp));
        });

        /**
         * Route to create a profile from given body
         */
         AuthManager.getInstance().registerEndpointPermission("profile.create", {endpoint: new RegExp("/v1/profiles/create/", "g"), method: "post"});
         this._router.put('/create/', async (req: Request, res: Response) => {

            if(req.body.id == "created")
            {
                delete req.body.id;

                const profile = req.body as IProfileHydrated;
                const created = this.prepareToStore(profile);

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

            const p: IProfileHydrated = req.body;

            p.modificationDate = Date.now();

            const profile = this.prepareToStore(p);
            
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
                const profile = req.body as IProfileHydrated;
                const copied = this.prepareToStore(profile);

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
    /**
     * Hydrate the profile with its skeleton
     * @param profileStored Profile to hydrate from
     * @returns The profile hydrated
     */
    public hydrateProfile(profileStored: IProfileStored | IProfileConfig): IProfileHydrated | undefined {

        // Find the skeleton assignated to this profile
        const profileSkeleton = this.profileSkeletons.get(profileStored.skeleton);

        // Make sure that we have the skeleton for this profile
        if(profileSkeleton !== undefined)
        {
            // Force the creation of a `modificationDate`,
            // because premade profiles dont have a modification date
            if(!("modificationDate" in profileStored))
                (profileStored as IProfileStored).modificationDate = Date.now();

            const clonedProfileValues = Object.entries(structuredClone(profileStored.values)).map(v => profileSkeleton.fields.find(n => {if(n.name == v[0]) { n.value = v[1]; return true; }}));

            const returnProfile: IProfileHydrated = {...profileStored as IProfileStored, values: clonedProfileValues.filter(f => f !== undefined) as ProfileSkeletonFields[]};
            return returnProfile;
        }
        return;
    }

    /**
     * Prepare the profile to be ready to store on mongodb
     * @param profileHydrated Profile to be transformed
     * @returns Profile transformed ready to be stored
     */
    public prepareToStore(profileHydrated: IProfileHydrated): IProfileStored
    {
        const values: Record<string, number> = {};
        profileHydrated.values.forEach(v => values[v.name] = v.value);

        const returnProfile: IProfileStored = {...profileHydrated, values: values};

        return returnProfile;
    }

    public getPremade(id: string): IProfileHydrated | undefined
    {
        return this.profilePremades.find(p => p.name === id);
    }

    public async socketData(): Promise<IProfileHydrated[]>
    {
        const list = await ProfileModel.find({}).lean();
        return [...list.map(p => this.hydrateProfile(p)), ...this.profilePremades] as IProfileHydrated[]
    }
}