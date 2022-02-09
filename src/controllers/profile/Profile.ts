import { Schema, model} from "mongoose";
import { IProfile } from "../../interfaces/IProfile";

export const ProfileSchema = new Schema<IProfile>({
    skeleton: {type: String, required: true},
    name: {type: String, required: true},
    modificationDate: {type: Number, default: Date.now, required: true},
    removable: {type: Boolean, default: false, required: true},
    overwriteable: {type: Boolean, default: false, required: true},
    isPremade: {type: Boolean, default: false, required: true},
    values: {type: Map, of: Number, required: true}
});

export const ProfileModel = model("profile", ProfileSchema);
