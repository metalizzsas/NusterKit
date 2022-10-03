import { IProfileConfig, ProfileSkeletonFields } from "../../spec/profile";

export type IProfileHydrated = Omit<IProfileConfig, "values"> & { id?: string, modificationDate: number, values: ProfileSkeletonFields[] };

export type IProfileStored = IProfileConfig & { id?: string, modificationDate: number };