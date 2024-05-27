import type { Profile } from "../spec/profiles";

export type ProfileStored = Profile & { modificationDate: number } & { values: { profileId: undefined }[] };