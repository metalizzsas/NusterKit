import { Router } from "./Router";

import type { ProfileHydrated } from "../types/hydrated/profiles";
import type { Profile, ProfileSkeleton, ProfileSkeletonFields } from "../types/spec/profiles";
import type { NextFunction, Request, Response } from "express";
import { TurbineEventLoop } from "../events";
import type { Modify } from "../types/utils";
import { prisma } from "../db";
import type { Profile as ProfilePrisma, ProfileValue as ProfileValuePrisma } from "@prisma/client";

type ProfileStored = ProfilePrisma & { 
    values: ProfileValuePrisma[]
}

export class ProfilesRouter extends Router {

    private profileSkeletons: Map<string, ProfileSkeleton> = new Map<string, ProfileSkeleton>();
    
    constructor(profileSkeletons: ProfileSkeleton[], profilePremades: Profile[])
    {
        super();

        for(const skeleton of profileSkeletons)
        {
            this.profileSkeletons.set(skeleton.name, structuredClone(skeleton));
        }

        TurbineEventLoop.emit('log', 'info', 'ProfilesRouter: Updating premade profiles.');
        prisma.profile.deleteMany({ where: { isPremade: true } }).then(async () => {

            for(const p of profilePremades)
            {
                const profileBase = await prisma.profile.create({ data: { 
                    id: p.id,
                    name: p.name, 
                    skeleton: p.skeleton, 
                    isPremade: true,
                    modificationDate: new Date()  
                }});

                for(const value of p.values)
                {
                    await prisma.profileValue.create({ data: { 
                        key: value.key, 
                        value: value.value, 
                        profileId: profileBase.id 
                    }});
                }
            }
        });
        
        TurbineEventLoop.on('profile.read', async ({ profileID, callback }) => {
            const profile = await this.findProfile(profileID);
            callback?.(profile);
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
            
            const copied = this.prepareToStore(req.body);

            const created = await prisma.profile.create({ data: { 
                id: undefined, 
                name: copied.name, 
                skeleton: copied.skeleton, 
                isPremade: false, 
                modificationDate: new Date(), 
                values: { 
                    create: copied.values.map(v => { return { key: v.key, value: v.value } })
                }
            }});

            const stored = await prisma.profile.findUnique({ where: { id: created.id }, include: { values: true } });

            if(stored === null)
            {
                res.status(500).end("Failed to find copied profile in database");
                return;
            }

            res.status(200).json(this.hydrateProfile(stored));
            return;
        });

        /** Route to get a profile by its `id` */
        this.router.get('/:id', async (req: Request, res: Response) => {
            const profile = await prisma.profile.findUnique({ where: { id: req.params.id }, include: { values: true } });

            res.status(profile ? 200 : 404);

            (profile) ? res.json(this.hydrateProfile(profile)) : res.end(`Could not find profile with id ${req.params.id}.`);
        });

        /** Route to delete a profile with its `id` */
        this.router.delete('/:id', this.premadeProtect, async (req: Request, res: Response) => {
            try
            {
                await prisma.profile.delete({ where: { id: req.params.id }});
                res.status(200).end();
            }
            catch(ex)
            {
                res.status(404).json(ex);
            }
        });
        
        /** Route to Update a profile */
        this.router.patch('/:id', this.premadeProtect, async (req: Modify<Request, { body: ProfileHydrated }> , res: Response) => {

            req.body.modificationDate = new Date();

            const profile = this.prepareToStore(req.body);

            prisma.profile.update({
                where: { id: req.params.id },
                data: {
                    name: profile.name,
                    skeleton: profile.skeleton,
                    modificationDate: undefined,
                    values: {
                        deleteMany: { profileId: req.params.id },
                        create: profile.values.map(v => { return { key: v.key, value: v.value } })
                    }
                }
            }).then(() => {
                res.status(200).end("ok");
            }).catch(() => {
                res.status(404).end("failed to save profile");
            });
        });
    }

    /** 
     * Premade protection for `DELETE` & `PATCH`
     */
    private async premadeProtect(req: Request, res: Response, next: NextFunction)
    {
        const profile = await prisma.profile.findUnique({ where: { id: req.params.id } });

        if(profile !== null && profile.isPremade)
        {
            res.status(403).end("Cannot edit or remove premade profiles.");
            return;
        }
        else
            next();
    }

    /**
     * Hydrate the profile with its skeleton
     * @param profileStored Profile to hydrate from
     * @returns The profile hydrated
     */
    public hydrateProfile(profileStored: ProfileStored): ProfileHydrated {

        // Find the skeleton assignated to this profile
        const profileSkeleton = structuredClone(this.profileSkeletons.get(profileStored.skeleton));

        // Make sure that we have the skeleton for this profile
        if(profileSkeleton !== undefined)
        {
            const clonedProfileValues = profileSkeleton.fields.map(f => { return {...f, value: profileStored.values.find(v => v.key == f.name)?.value }}).filter(f => f.value !== undefined) as ProfileSkeletonFields[];

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
                        throw new Error(`Could not find field ${sfn} in skeleton ${profileSkeleton.name}`);
                    
                    clonedProfileValues.push(fieldToAdd);
                }
            }

            return {
                ...profileStored, 
                values: clonedProfileValues.filter(f => skeletonFieldNames.includes(f.name))
            };
        }

        throw new Error(`Could not find skeleton for profile ${profileStored.name}`);
    }

    /**
     * Find the profile and hydrates it from database
     * @param id ID of the profile to find and hydrate from db
     * @returns Profile hydrated if it was found
     */
    public async findProfile(id: string): Promise<ProfileHydrated | undefined>
    {
        const profile = await prisma.profile.findUnique({ where: { id: id }, include: { values: true } });

        if(profile)
            return this.hydrateProfile(profile);

        return;
    }

    /**
     * Prepare the profile to be ready to store on mongodb
     * @param profileHydrated Profile to be transformed
     * @param removeID Removes the profile id to store
     * @returns Profile transformed ready to be stored
     */
    public prepareToStore(profileHydrated: ProfileHydrated): ProfileStored
    {
        const mappedValues = profileHydrated.values.map(v => { return { key: v.name, value: v.value, profileId: profileHydrated.id, id: undefined } });

        const returnProfile: ProfileStored = {...profileHydrated, values: mappedValues};

        return returnProfile;
    }

    public async profileList(): Promise<ProfileHydrated[]>
    {
        return (await prisma.profile.findMany({ include: { values: true }, orderBy: [{ isPremade: "asc"}, { modificationDate: "desc"}] })).map(d => this.hydrateProfile(d));
    }
}