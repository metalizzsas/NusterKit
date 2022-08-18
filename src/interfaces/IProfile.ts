import { ObjectId } from "mongoose";

export interface IConfigProfile extends Omit<IProfile, "values">
{
    values: {[x: string]: number | boolean};
}

export interface IProfile
{
    modificationDate?: number;
    skeleton: string;
    name: string;
    isPremade: boolean;
    removable: boolean;
    overwriteable: boolean;

    values: Map<string, number>;
}

export interface IProfileSkeleton
{
    identifier: string;
    fieldGroups: IProfileSkeletonFieldGroup[]
}
interface IProfileSkeletonFieldGroup
{
    name: string;
    fields: ProfileSkeletonFields[];
}

export type ProfileSkeletonFields = (IProfileSkeletonFieldFloat | IProfileSkeletonFieldBoolean | IProfileSkeletonFieldNumber | IProfileSkeletonFieldTime) & IProfileSkeletonField;

interface IProfileSkeletonField
{
    name: string;
    type: "bool" | "float" | "int" | "time";
    value: number | boolean;

    unity?: string;
}

interface IProfileSkeletonFieldFloat extends IProfileSkeletonField
{
    type: "float";
    value: number;
    floatMin: number;
    floatMax: number;
    floatStep: number;
}

interface IProfileSkeletonFieldBoolean extends IProfileSkeletonField
{
    type: "bool";
    value: boolean;
}

interface IProfileSkeletonFieldNumber extends IProfileSkeletonField
{
    type: "int";
    value: number;
}

interface IProfileSkeletonFieldTime extends IProfileSkeletonField
{
    type: "time";
    units: ("hours" | "minutes" | "seconds" | "milliseconds")[]
    value: number;
}

export interface IProfileExportable extends IProfileSkeleton
{
    id?: ObjectId;
    isPremade: boolean;
    name: string;
    modificationDate: number;
    removable: boolean;
    overwriteable: boolean;
}