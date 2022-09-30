import { IProfileSkeleton } from "../../spec/profile";

/** Stored format of the profile in the database */
export interface IProfileExportable extends IProfileSkeleton
{
    /** Is this profile premade */
    isPremade: boolean;
    /** Name of the profile */
    name: string;
    /** Last modification date of the profile */
    modificationDate: number;
    /** Is this profile removable */
    removable: boolean;
    /** Is this profile Overwritable */
    overwriteable: boolean;
}