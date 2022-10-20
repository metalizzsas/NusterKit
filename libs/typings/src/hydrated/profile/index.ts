import { IProfileConfig, ProfileSkeletonFields } from "../../spec/profile";

export type IProfileHydrated = Omit<IProfileConfig, "values"> & { modificationDate: number, values: ProfileSkeletonFields[] };

export type IProfileStored = IProfileConfig & { modificationDate: number };