import type { IMaintenanceHydrated } from "@metalizzsas/nuster-typings/build/hydrated/maintenance";
import type { ICountableMaintenance } from "@metalizzsas/nuster-typings/build/spec/maintenance/CountableMaintenance";
import { LoggerInstance } from "../../app";
import { Maintenance } from "./Maintenance";
import { MaintenanceModel } from "./MaintenanceModel";

export class CountableMaintenance extends Maintenance implements ICountableMaintenance {

    durationType: "duration" | "cycle";
    durationLimit: number;

    private duration: number;

    constructor(obj: ICountableMaintenance)
    {
        super(obj);

        this.durationType = obj.durationType;
        this.durationLimit = obj.durationLimit;
        this.duration = 0;

        this.loadTrackerData();
    }

    async loadTrackerData()
    {
        const doc = await MaintenanceModel.findOne({ name: this.name });

        if(!doc)
        {
            LoggerInstance.error(`Maintenance-${this.name}: Tracker does not exists.`);
            return;
        }

        this.duration = doc.duration ?? 0;
    }

    /** Append duration to this task */
    async append(value: number)
    {
        const document = await MaintenanceModel.findOneAndUpdate({name: this.name}, {$inc: {duration: value}});

        if(document)
            this.duration += value;
        else
            LoggerInstance.warn("Maintenance: Failed to append data to " + this.name + " tracker.");
    }

    /** Reset maintenance task */
    async reset()
    {
        const document = await MaintenanceModel.findOneAndUpdate({ name: this.name }, { duration: 0, operationDate: Date.now() });

        if(document)
        {
            this.duration = document.duration;
            this.operationDate = document.operationDate;
        }
        else
            LoggerInstance.error(`Maintenance: Failed to update ${this.name} document.`);
    }

    /** Compute the task actual progress */
    get computeDurationProgress(): number
    {
        return Math.floor((this.duration / this.durationLimit) * 10) / 10;
    }

    toJSON(): IMaintenanceHydrated 
    {
        return { 
            name: this.name,
            durationType: this.durationType,
            duration: this.duration,
            durationMax: this.durationLimit,
            durationProgress: this.computeDurationProgress
        }
    }
}