import type { BaseMaintenance } from "@metalizzsas/nuster-typings/build/spec/maintenances";
import { LoggerInstance } from "../app";
import { MaintenanceModel } from "../models/MaintenanceModel";

export class Maintenance implements BaseMaintenance
{
    name: string;

    durationType: "cycle" | "duration" | "sensor";

    operationDate?: number;

    constructor(obj: BaseMaintenance)
    {
        this.name = obj.name
        this.durationType = obj.durationType;
    }

    async checkTracker()
    {
        const doc = await MaintenanceModel.findOne({ name: this.name });

        if(doc)
        {
            this.operationDate = doc.operationDate;
            return;
        }

        LoggerInstance.warn(`Maintenance-${this.name}: Maintenance tracker not found, creating it...`);
        await MaintenanceModel.create({
            name: this.name
        });
    }

    reset(): void {
        throw Error("Not implemented");
    }
}