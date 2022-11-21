import { Controller } from "../Controller";

import type { Request, Response } from "express";
import { LoggerInstance } from "../../app";
import { AuthManager } from "../../auth/auth";
import { ProfileModel } from "./ProfileModel";

import type { IProfileSkeleton, ProfileSkeletonFields, IProfileConfig } from "@metalizzsas/nuster-typings/build/spec/profile";
import type { IProfileHydrated, IProfileStored } from "@metalizzsas/nuster-typings/build/hydrated/profile";
import { ProgramHistoryModel } from "../cycle/ProgramHistoryModel";

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

        this._router.get('/last', async (_req: Request, res: Response) => {

            const history = await ProgramHistoryModel.findOne({ 'cycle.name': "default", 'profile.name': "Quickstart" }, {}, {sort: {
                'cycle.status.endDate': -1
            }});

            if(!history || history.profile === undefined)
            {
                res.status(404).end();
                return;
            }
            else
            {
                const profile = history.toJSON().profile;
                res.json(this.hydrateProfile(profile));
            }
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
                const profile = await ProfileModel.findById(req.params.id).lean();
                res.status(profile ? 200 : 404);
    
                (profile) ? res.json(this.hydrateProfile(profile)) : res.end();
            }
        });

        /**
         * Route to create a default profile with the given JSON Structure
         */
         AuthManager.getInstance().registerEndpointPermission("profile.create", {endpoint: new RegExp("/v1/profiles/create/.*", "g"), method: "post"});
         this._router.post('/create/:type', async (req: Request, res: Response) => {
            
            const p = this.createProfile(req.params.type);

            if(p !== undefined)
            {
                const storedProfileTemp = await ProfileModel.create(p);

                const storedProfile = (await ProfileModel.findById(storedProfileTemp.id))?.toObject();

                if(storedProfile)
                {
                    const returnProfile = this.hydrateProfile(storedProfile);
    
                    if(returnProfile)
                    {
                        res.json(returnProfile);
                    }
                    else
                    {
                        res.status(500).end();
                    }
                }
                else
                {
                    res.status(404).end(`failed to find stored profile with id ${storedProfileTemp.id}`)
                }
            }
            else
            {
                res.status(404).end();
            }
        });

        /**
         * Route to create a profile from given body
         */
        AuthManager.getInstance().registerEndpointPermission("profile.create", {endpoint: new RegExp("/v1/profiles/create/", "g"), method: "post"});
        this._router.put('/create/', async (req: Request & { body: IProfileHydrated }, res: Response) => {

            if(req.body._id == "created")
            {
                delete req.body._id;

                req.body.isOverwritable = true;
                req.body.isRemovable = true;
                req.body.isPremade = false;

                const created = this.prepareToStore(req.body);
                const mongooseCreated = await ProfileModel.create(created);

                res.status(200).json(this.hydrateProfile(mongooseCreated.toJSON()));
                return;
            }
            else
            {
                res.status(400).end();
                return;
            }
        });

        AuthManager.getInstance().registerEndpointPermission("profile.edit", {endpoint: "/v1/profiles/", method: "post"});
        this._router.post('/', async (req: Omit<Request, "body"> & { body: IProfileHydrated }, res: Response) => {

            if(req.body._id !== undefined && req.body._id.startsWith("premade_"))
            {
                res.status(403).write("cant edit premade profiles");
                return;
            }

            const p: IProfileHydrated = req.body;

            p.modificationDate = Date.now();

            const profile = this.prepareToStore(p);
            
            const request = await ProfileModel.findByIdAndUpdate(profile._id, profile);

            if(request)
                res.status(402).end("not ok");
            else
                res.status(200).end("ok");
        });

        AuthManager.getInstance().registerEndpointPermission("profiles.delete", {endpoint: new RegExp("/v1/profiles/.*", "g"), method: "delete"});
        this._router.delete('/:id', async (req: Request, res: Response) => {
            if(req.params.id != null)
            {
                await ProfileModel.findByIdAndDelete(req.params.id, {}, (err, doc) => {
                    if(doc && !err)
                        res.status(200).end();
                    else
                        res.status(404).end();
                });
            }
            else
            {
                res.status(400).end();
                return;
            }
        });

        AuthManager.getInstance().registerEndpointPermission("profiles.create", {endpoint: "/v1/profiles/", method: "put"});
        this._router.put('/', async (req: Omit<Request, "body"> & { body: IProfileHydrated }, res: Response) => {

            if(req.body._id == "copied")
            {
                delete req.body._id;
                delete req.body.isOverwritable;
                delete req.body.isPremade;
                delete req.body.isRemovable;
                
                const copied = this.prepareToStore(req.body);

                res.status(200).json(await (await ProfileModel.create(copied)).toObject());
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
     * Create profile from skeleton
     * @param profileSkeletonName Skeleton name to use
     * @deprecated
     * @returns newly created profile to be saved in DB
     */
    public createProfile(profileSkeletonName: string): IProfileStored | undefined
    {
        const profileSkeleton = structuredClone(this.profileSkeletons.get(profileSkeletonName))

        if(profileSkeleton !== undefined)
        {
            const createdProfile: IProfileHydrated = {
                name: "defaultProfileName",
                skeleton: profileSkeleton.name,
                modificationDate: Date.now(),
                isRemovable: undefined,
                isOverwritable: undefined,
                isPremade: undefined,
                values: profileSkeleton.fields
            };

            return this.prepareToStore(createdProfile);
        }
    }

    /**
     * Hydrate the profile with its skeleton
     * @param profileStored Profile to hydrate from
     * @returns The profile hydrated
     */
    public hydrateProfile(profileStored: IProfileStored | IProfileConfig): IProfileHydrated | undefined {

        // Find the skeleton assignated to this profile
        const profileSkeleton = structuredClone(this.profileSkeletons.get(profileStored.skeleton));

        // Make sure that we have the skeleton for this profile
        if(profileSkeleton !== undefined)
        {
            // Force the creation of a `modificationDate`,
            // because premade profiles dont have a modification date
            if(!("modificationDate" in profileStored))
                (profileStored as IProfileStored).modificationDate = Date.now();

            const clonedProfileValues = Object.entries(structuredClone(profileStored.values)).map(v => profileSkeleton.fields.find(n => {if(n.name == v[0]) { n.value = v[1]; return true; }})).filter(f => f !== undefined) as ProfileSkeletonFields[];

            // Check if all skeleton fields are applied to the profile.
            // If not check all fields and add the missing ones.
            // This is usefull when profile are updated to newer skeleton with addtional fields
            
            const skeletonFieldNames = profileSkeleton.fields.flatMap(f => f.name);

            for(const sfn of skeletonFieldNames)
            {
                if(clonedProfileValues.find(v => v.name == sfn) === undefined)
                {
                    const fieldToAdd = profileSkeleton.fields.find(f => f.name == sfn);
                    
                    if(fieldToAdd === undefined)
                        return;
                    
                    clonedProfileValues.push(fieldToAdd);
                }
            }

            const returnProfile: IProfileHydrated = {...profileStored as IProfileStored, values: clonedProfileValues};
            return returnProfile;
        }
        return;
    }

    /**
     * Find the profile and hydrates it from database
     * @param id ID of the profile to find and hydrate from db
     * @returns Profile hydrated if it was found
     */
    public async findProfile(id: string): Promise<IProfileHydrated | undefined>
    {
        const profile = await ProfileModel.findById(id);

        if(profile)
            return this.hydrateProfile(profile.toJSON());

        return;
    }

    /**
     * Prepare the profile to be ready to store on mongodb
     * @param profileHydrated Profile to be transformed
     * @param removeID Removes the profile id to store
     * @returns Profile transformed ready to be stored
     */
    public prepareToStore(profileHydrated: IProfileHydrated, removeID = false): IProfileStored
    {
        const values: Record<string, number> = {};
        profileHydrated.values.forEach(v => values[v.name] = v.value);

        const returnProfile: IProfileStored = {...profileHydrated, values: values};
        
        if(removeID)
            delete returnProfile._id;

        return returnProfile;
    }

    public getPremade(id: string): IProfileHydrated | undefined
    {
        return this.profilePremades.find(p => p.name === id);
    }

    public async socketData(): Promise<IProfileHydrated[]>
    {
        const list = (await ProfileModel.find({})).map(d => this.hydrateProfile(d.toJSON()));
        return [...list, ...this.profilePremades] as IProfileHydrated[]
    }
}