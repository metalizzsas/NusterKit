import type { Profile, ProfileSkeletonFields } from "../../spec/profiles";

export type ProfileHydrated = Omit<Profile, "values"> & { modificationDate: number, values: ProfileSkeletonFields[] };