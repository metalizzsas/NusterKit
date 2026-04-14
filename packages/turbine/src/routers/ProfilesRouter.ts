import { Router } from "./Router";

import type { ProfileHydrated } from "../types/hydrated/profiles";
import type { Profile, ProfileSkeleton, ProfileSkeletonFields } from "../types/spec/profiles";
import { TurbineEventLoop } from "../events";
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
        }).catch(err => {
            TurbineEventLoop.emit('log', 'error', `ProfilesRouter: premade sync failed: ${(err as Error).message}`);
        });

        TurbineEventLoop.on('profile.read', async ({ profileID, callback }) => {
            const profile = await this.findProfile(profileID);
            callback?.(profile);
        })
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