import { Schema, model } from "mongoose";
import { IMaintenance } from "../../interfaces/IMaintenance";

const MaintenanceSchema = new Schema<IMaintenance>({
    name: { type: String, required: true }, //maintenance name
    duration: { type: Number, required: true }, // maitenance current duration
    operationDate: Number, // last maintenance operation date
});

export const MaintenanceModel = model<IMaintenance>("Maintenance", MaintenanceSchema);