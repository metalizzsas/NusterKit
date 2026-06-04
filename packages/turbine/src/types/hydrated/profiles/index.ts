import type { Profile, ProfileSkeletonFields } from "../../spec/profiles";

export type ProfileHydrated = Omit<Profile, "values"> & {
	/** Is profile premade */
	isPremade: boolean;

	/** Last modification date */
	modificationDate: Date;

	/** Optional user folder used to sort profiles in the UI */
	folder?: string | null;

	/** Array of values */
	values: ProfileSkeletonFields[];
};
