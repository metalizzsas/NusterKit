import { Router } from "./Router";

import type { ProfileHydrated } from "@metalizzsas/nuster-typings/build/hydrated/profiles";
import type { Profile, ProfileSkeleton, ProfileSkeletonFields } from "@metalizzsas/nuster-typings/build/spec/profiles";
import type { ProfileStored } from "@metalizzsas/nuster-typings/build/stored";
import type { NextFunction, Request, Response } from "express";
import { ProfileModel } from "../models";
import { TurbineEventLoop } from "../events";
import type { Modify } from "@metalizzsas/nuster-typings/build/utils/Modify";

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
            const hydrated = this.hydrateProfile(p);

            if(hydrated !== undefined)
                this.profilePremades.push(hydrated);
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
        /** Route to List profiles */
        this.router.get('/', async (_req: Request, res: Response) => {
            res.json(await this.profileList());
        });

        /** Route to copy a profile */
        this.router.post('/', async (req: Modify<Request, { body: ProfileHydrated }>, res: Response) => {
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

        /** Route to get a profile by its `id` */
        this.router.get('/:id', async (req: Request, res: Response) => {
            if(req.params.id.startsWith("premade_"))
            {
                const profile = this.getPremade(req.params.id.split("_")[1]);
                res.status(profile ? 200 : 404);

                (profile) ? res.json(profile) : res.end(`Could not find profile with id ${req.params.id}.`);
            }
            else
            {
                const profile = await ProfileModel.findById(req.params.id).lean();
                res.status(profile ? 200 : 404);
    
                (profile) ? res.json(this.hydrateProfile(profile)) : res.end(`Could not find profile with id ${req.params.id}.`);
            }
        });

        /** Middleware to prevent deleting or editing premad profiles. */
        this.router.all('/:id', (req: Request, res: Response, next: NextFunction) => {
            if(req.params.id.startsWith("premade_"))
            {
                res.status(403).end("Cannot edit or remove premade profiles.");
                return;
            }
            else
                next();
        });

        /** Route to delete a profil with its `id` */
        this.router.delete('/:id', async (req: Request, res: Response) => {
            await ProfileModel.findByIdAndDelete(req.params.id, {}, (err, doc) => {
                if(doc && !err)
                    res.status(200).end();
                else
                    res.status(404).end();
            });
        });
        
        /** Route to Update a profile */
        this.router.patch('/:id', async (req: Modify<Request, { body: ProfileHydrated }> , res: Response) => {

            const p: ProfileHydrated = req.body;
            p.modificationDate = Date.now();

            const profile = this.prepareToStore(p);
            
            ProfileModel.findByIdAndUpdate(profile._id, profile)
            .then(() => {
                res.status(200).end("ok");
            }).catch(() => {
                res.status(404).end("failed to save profile");
            });
        });
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