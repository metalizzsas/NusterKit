import type { Profile, ProfileSkeletonFields } from "../../spec/profiles";

export type ProfileHydrated = Omit<Profile, "values"> & { 
    /** Profile ID in database */
    id: number,

    /** Is profile premade */
    isPremade: boolean,

    /** Last modification date */
    modificationDate: Date, 

    /** Array of values */
    values: ProfileSkeletonFields[] 
};