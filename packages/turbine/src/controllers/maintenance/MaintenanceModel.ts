import { IMaintenanceStored } from "@metalizzsas/nuster-typings/src/hydrated/maintenance";
import { model, Schema } from "mongoose";

const MaintenanceSchema = new Schema<IMaintenanceStored>({
    name: { type: String, required: true }, //maintenance name
    duration: { type: Number, required: true }, // maitenance current duration
    operationDate: Number, // last maintenance operation date
});

export const MaintenanceModel = model<IMaintenanceStored>("Maintenance", MaintenanceSchema);