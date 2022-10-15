import type { IProfileStored } from "@metalizzsas/nuster-typings/build/hydrated/profile";
import { model, Schema } from "mongoose";

export const ProfileSchema = new Schema<IProfileStored>({
    name: {type: String, required: true},
    skeleton: {type: String, required: true},

    modificationDate: {type: Number, default: Date.now, required: true},

    isPremade: {type: Boolean, default: false},
    isRemovable: {type: Boolean, default: false},
    isOverwritable: {type: Boolean, default: true},

    values: {type: Map, of: Number, required: true}
});

export const ProfileModel = model("profile", ProfileSchema);
