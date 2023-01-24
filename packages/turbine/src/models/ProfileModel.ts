import type { ProfileStored } from "@metalizzsas/nuster-typings/build/stored";
import { model, Schema } from "mongoose";

export const ProfileSchema = new Schema<ProfileStored>({
    name: {type: String, required: true},
    skeleton: {type: String, required: true},

    modificationDate: {type: Number, default: Date.now, required: true},

    isPremade: {type: Boolean},

    values: {type: Map, of: Number, required: true}
});

export const ProfileModel = model("profile", ProfileSchema);
