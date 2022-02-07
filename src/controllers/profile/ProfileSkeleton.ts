import { Types } from "mongoose";

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
    id?: Types.ObjectId;
    isPremade: boolean;
    name: string;
    modificationDate: number;
    removable: boolean;
    overwriteable: boolean;
}