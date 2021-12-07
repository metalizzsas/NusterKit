import { Schema, model } from "mongoose";

export interface IProfileMapper {
    [key: string]: IProfile
}

export interface IProfile
{
    identifier: string;
    name: string;
    modificationDate: number;
    fieldGroups: IProfileFieldGroup[]
}
interface IProfileFieldGroup
{
    name: string;
    fields: IProfileField[]
}
interface IProfileField
{
    name: string;
    type: string;
    value: number;

    unity?: string;
    floatMin?: number;
    floatMax?: number;
    floatStep?: number;
}

const ProfileFieldSchema = new Schema<IProfileField>({
    name: {type: String, required: true},
    type: {type: String, required: true},
    value: {type: Number, required: true},

    unity: String,
    floatMin: Number, 
    floatMax: Number,
    floatStep: Number
});

const ProfileFieldGroupSchema = new Schema<IProfileFieldGroup>({
    name: {type: String, required: true},
    fields: {type: [ProfileFieldSchema], required: true}
});

export const ProfileSchema = new Schema<IProfile>({
    identifier: {type: String, required: true},
    name: {type: String, required: true},
    modificationDate: {type: Number, default: Date.now, required: true},
    fieldGroups: {type: [ProfileFieldGroupSchema], required: true}
});

export const ProfileModel = model("profile", ProfileSchema);