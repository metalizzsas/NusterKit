import { Schema, model, Types } from "mongoose";

export interface IProfileMapper {
    [key: string]: IProfile
}

export interface IProfile
{
    id?: Types.ObjectId;
    modificationDate?: number;
    skeleton: string;
    name: string;
    removable: boolean;
    overwriteable: boolean;

    values: Map<string, number>
}

export const ProfileSchema = new Schema<IProfile>({
    skeleton: {type: String, required: true},
    name: {type: String, required: true},
    modificationDate: {type: Number, default: Date.now, required: true},
    removable: {type: Boolean, default: false, required: true},
    overwriteable: {type: Boolean, default: false, required: true},
    values: {type: Map, of: Number, required: true}
});

export const ProfileModel = model("profile", ProfileSchema);