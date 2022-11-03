import type { IBaseMaintenance, IConfigMaintenance, IMaintenanceProcedure } from "@metalizzsas/nuster-typings/build/spec/maintenance";
import { LoggerInstance } from "../../app";
import { MaintenanceModel } from "./MaintenanceModel";

export class Maintenance implements IBaseMaintenance
{
    name: string;

    durationType: "cycle" | "duration" | "sensor";

    operationDate?: number;
    procedure?: IMaintenanceProcedure;

    constructor(obj: IConfigMaintenance)
    {
        this.name = obj.name
        this.durationType = obj.durationType;
        this.procedure = obj.procedure;

        void this.checkTracker();
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