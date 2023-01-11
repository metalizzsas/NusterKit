import { Router } from "./Router";

import type { ProfileHydrated } from "@metalizzsas/nuster-typings/build/hydrated/profiles";
import type { Profile, ProfileSkeleton, ProfileSkeletonFields } from "@metalizzsas/nuster-typings/build/spec/profiles";
import type { ProfileStored } from "@metalizzsas/nuster-typings/build/stored";
import type { Request, Response } from "express";
import { ProfileModel } from "../models";
import { AuthManager } from "./middleware/auth";
import { TurbineEventLoop } from "../events";

export class ProfilesRouter extends Router {

    private profileSkeletons: Map<string, ProfileSkeleton> = new Map<string, ProfileSkeleton>();
    private profilePremades: ProfileHydrated[] = [];
    
    constructor(profileSkeletons: ProfileSkeleton[], profilePremades: Profile[])
    {
        super();

        for(const skeleton of profileSkeletons)
        {
            this.profileSkeletons.set(skeleton.name, structuredClone(skeleton));
        }
        
        for(const p of profilePremades)
        {
            const converted = this.hydrateProfile(p);

            if(converted !== undefined)
            {
                this.profilePremades.push(converted);
            }
        }

        TurbineEventLoop.on('profile.read', async ({ profileID, callback }) => {
            if(profileID.startsWith("premade_"))
                callback?.(this.getPremade(profileID.split("_")[1]))
            else
            {
                const profile = await this.findProfile(profileID);
                callback?.(profile);
            }
        })

        this._configureRouter();
    }

    private _configureRouter()
    {
        /**
         * List available profile maps
         */
        AuthManager.getInstance().registerEndpointPermission("profiles.list", {endpoint: "/v1/profiles/skeletons", method: "get"});
        this.router.get('/skeletons', (_req: Request, res: Response) => {
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
        this.router.get('/', async (_req: Request, res: Response) => {
            res.json(await this.profileList());
        });

        /**
         * Route to List profile by identifier
         */
        AuthManager.getInstance().registerEndpointPermission("profiles.list", {endpoint: new RegExp("/v1/profiles/types/.*", "g"), method: "get"});
        this.router.get('/type/:type', async (req: Request, res: Response) => {
            const profiles = await ProfileModel.find({ identifier: req.params.type });

            res.json(profiles);
        });

        AuthManager.getInstance().registerEndpointPermission("profiles.list", {endpoint: new RegExp("/v1/profiles/.*", "g"), method: "get"});
        this.router.get('/:id', async (req: Request, res: Response) => {
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
         this.router.post('/create/:type', async (req: Request, res: Response) => {
            
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
        this.router.put('/create/', async (req: Request & { body: ProfileHydrated }, res: Response) => {

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
        this.router.post('/', async (req: Omit<Request, "body"> & { body: ProfileHydrated }, res: Response) => {

            if(req.body._id !== undefined && req.body._id.startsWith("premade_"))
            {
                res.status(403).write("cant edit premade profiles");
                return;
            }

            const p: ProfileHydrated = req.body;

            p.modificationDate = Date.now();

            const profile = this.prepareToStore(p);
            
            ProfileModel.findByIdAndUpdate(profile._id, profile)
            .then(() => {
                res.status(200).end("ok");
            }).catch(() => {

                res.status(403).end("failed to save profile");
            });
        });

        AuthManager.getInstance().registerEndpointPermission("profiles.delete", {endpoint: new RegExp("/v1/profiles/.*", "g"), method: "delete"});
        this.router.delete('/:id', async (req: Request, res: Response) => {
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
        this.router.put('/', async (req: Omit<Request, "body"> & { body: ProfileHydrated }, res: Response) => {

            if(req.body._id === "copied")
            {
                delete req.body._id;
                delete req.body.isPremade;
                
                const copied = this.prepareToStore(req.body);

                const stored = (await ProfileModel.create(copied));

                res.status(200).json(this.hydrateProfile(stored.toJSON()));
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
    public createProfile(profileSkeletonName: string): ProfileStored | undefined
    {
        const profileSkeleton = structuredClone(this.profileSkeletons.get(profileSkeletonName))

        if(profileSkeleton !== undefined)
        {
            const createdProfile: ProfileHydrated = {
                name: "defaultProfileName",
                skeleton: profileSkeleton.name,
                modificationDate: Date.now(),
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
    public hydrateProfile(profileStored: ProfileStored | Profile): ProfileHydrated | undefined {

        // Find the skeleton assignated to this profile
        const profileSkeleton = structuredClone(this.profileSkeletons.get(profileStored.skeleton));

        // Make sure that we have the skeleton for this profile
        if(profileSkeleton !== undefined)
        {
            // Force the creation of a `modificationDate`,
            // because premade profiles dont have a modification date
            if(!("modificationDate" in profileStored))
                (profileStored as ProfileStored).modificationDate = Date.now();

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

            const returnProfile: ProfileHydrated = {...profileStored as ProfileStored, values: clonedProfileValues};
            return returnProfile;
        }
        return;
    }

    /**
     * Find the profile and hydrates it from database
     * @param id ID of the profile to find and hydrate from db
     * @returns Profile hydrated if it was found
     */
    public async findProfile(id: string): Promise<ProfileHydrated | undefined>
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
    public prepareToStore(profileHydrated: ProfileHydrated, removeID = false): ProfileStored
    {
        const values: Record<string, number> = {};
        profileHydrated.values.forEach(v => values[v.name] = v.value);

        const returnProfile: ProfileStored = {...profileHydrated, values: values};
        
        if(removeID)
            delete returnProfile._id;

        return returnProfile;
    }

    public getPremade(id: string): ProfileHydrated | undefined
    {
        return this.profilePremades.find(p => p.name === id);
    }

    public async profileList(): Promise<ProfileHydrated[]>
    {
        const list = (await ProfileModel.find({})).map(d => this.hydrateProfile(d.toJSON()));
        return [...list, ...this.profilePremades] as ProfileHydrated[]
    }
}