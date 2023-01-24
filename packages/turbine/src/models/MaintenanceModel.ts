import type { MaintenanceStored } from "@metalizzsas/nuster-typings/build/stored";
import { model, Schema } from "mongoose";

const MaintenanceSchema = new Schema<MaintenanceStored>({
    name: { type: String, required: true }, //maintenance name
    duration: Number, // maitenance current duration
    operationDate: Number, // last maintenance operation date
});

export const MaintenanceModel = model<MaintenanceStored>("Maintenance", MaintenanceSchema);