import { Schema, model } from "mongoose";
import { Field } from "sparkson";

export interface IProfile
{
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

var ProfileFieldSchema = new Schema<IProfileField>({
    name: {type: String, required: true},
    type: {type: String, required: true},
    value: {type: Number, required: true},

    unity: String,
    floatMin: Number, 
    floatMax: Number,
    floatStep: Number
});

var ProfileFieldGroupSchema = new Schema<IProfileFieldGroup>({
    name: {type: String, required: true},
    fields: {type: [ProfileFieldSchema], required: true}
});

const ProfileSchema = new Schema<IProfile>({
    name: {type: String, required: true},
    modificationDate: {type: Number, default: Date.now, required: true},
    fieldGroups: {type: [ProfileFieldGroupSchema], required: true}
});

export const ProfileModel = model("profile", ProfileSchema);