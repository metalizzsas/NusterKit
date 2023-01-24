import type { ContainerStored } from "@metalizzsas/nuster-typings/build/stored";
import { model, Schema } from "mongoose";

const ContainerSchema = new Schema<ContainerStored>({
    name: { type: String, required: true},
    loadDate: { type: String, required: true, default: new Date().toISOString() },
    loadedProductType: { type: String, required: true}
});

export const ContainerModel = model('slot', ContainerSchema);