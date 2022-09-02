import { ObjectId } from "mongoose";

/** Profiles stored in the configuration `specs.json` file */
export interface IConfigProfile extends Omit<IProfile, "values">
{
    values: {[x: string]: number | boolean};
}

/** Object used internaly by ProfileController */
export interface IProfile
{
    /** Profile name */
    name: string;
    /** Profile Skeleton reference */
    skeleton: string;
    /** Last profile modification data */
    modificationDate?: number;
    /** Is this profile premade */
    isPremade: boolean;
    /** Is this profile removable */
    removable: boolean;
    /** Is this profile overwritable */
    overwriteable: boolean;

    /** Map of the profile values */
    values: Map<string, number>;
}

export interface IProfileSkeleton
{
    /** Profile identifier, used to map between profiles and cycles */
    identifier: string;
    /** Fiels groups of this profile skeleton */
    fieldGroups: IProfileSkeletonFieldGroup[]
}
interface IProfileSkeletonFieldGroup
{
    /** Name of the profile field group */
    name: string;
    /** Profile fields */
    fields: ProfileSkeletonFields[];
}

/** Base profile types */
export type ProfileSkeletonFields = (IProfileSkeletonFieldFloat | IProfileSkeletonFieldBoolean | IProfileSkeletonFieldNumber | IProfileSkeletonFieldTime) & IProfileSkeletonField;

interface IProfileSkeletonField
{
    /** Name of the profile field */
    name: string;
    /** Type of the profile field */
    type: "bool" | "float" | "int" | "time";
    /** Value contained byt the profile field */
    value: number | boolean;

    /** Unity of the profile field, it used for UI purposes only */
    unity?: string;
}

/** Float ProfileField type */
interface IProfileSkeletonFieldFloat extends IProfileSkeletonField
{
    type: "float";
    value: number;
    floatMin: number;
    floatMax: number;
    floatStep: number;
}
/** Boolean profile field type */
interface IProfileSkeletonFieldBoolean extends IProfileSkeletonField
{
    type: "bool";
    value: boolean;
}

/** Number profile field type */
interface IProfileSkeletonFieldNumber extends IProfileSkeletonField
{
    type: "int";
    value: number;
}

/** Time profile field type */
interface IProfileSkeletonFieldTime extends IProfileSkeletonField
{
    type: "time";
    units: ("hours" | "minutes" | "seconds" | "milliseconds")[]
    value: number;
}

/** Stored format of the profile in the database */
export interface IProfileExportable extends IProfileSkeleton
{
    /** Id of the profile */
    id?: ObjectId;
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