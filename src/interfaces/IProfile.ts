import { ObjectId } from "mongoose";

export interface IProfileMapper {
    [key: string]: IProfile
}

export interface IProfile
{
    modificationDate?: number;
    skeleton: string;
    name: string;
    isPremade: boolean;
    removable: boolean;
    overwriteable: boolean;

    values: Map<string, number>
}

export interface IProfileSkeleton
{
    identifier: string;
    fieldGroups: IProfileSkeletonFieldGroup[]
}
interface IProfileSkeletonFieldGroup
{
    name: string;
    fields: IProfileSkeletonField[]
}
interface IProfileSkeletonField
{
    name: string;
    type: string;
    value: number;

    unity?: string;
    floatMin?: number;
    floatMax?: number;
    floatStep?: number;
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