import { IProfileConfig, ProfileSkeletonFields } from "../../spec/profile";

export type IProfileHydrated = Omit<IProfileConfig, "values" | "id"> & { id?: string, modificationDate: number, values: ProfileSkeletonFields[] };

export type IProfileStored = Omit<IProfileConfig, "id"> & { id?: string, modificationDate: number };