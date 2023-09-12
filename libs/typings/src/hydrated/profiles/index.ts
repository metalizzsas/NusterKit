import type { Profile, ProfileSkeletonFields } from "../../spec/profiles";

export type ProfileHydrated = Omit<Profile, "values"> & { 

    /** Is profile premade */
    isPremade: boolean,

    /** Last modification date */
    modificationDate: Date, 

    /** Array of values */
    values: ProfileSkeletonFields[] 
};