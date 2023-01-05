import { LoggerInstance } from "../app";
import { Maintenance } from "./Maintenance";
import { MaintenanceModel } from "../models/MaintenanceModel";

import type { CountableMaintenance as CountableMaintenanceConfig } from "@metalizzsas/nuster-typings/build/spec/maintenances";
import type { MaintenanceHydrated } from "@metalizzsas/nuster-typings/build/hydrated/maintenance";
import { TurbineEventLoop } from "../events";

export class CountableMaintenance extends Maintenance implements CountableMaintenanceConfig {

    durationType: "duration" | "cycle";
    durationLimit: number;

    private duration: number;

    constructor(obj: CountableMaintenanceConfig)
    {
        super(obj);

        this.durationType = obj.durationType;
        this.durationLimit = obj.durationLimit;
        this.duration = 0;

        super.checkTracker().then(() => this.loadTrackerData());

        TurbineEventLoop.on(`maintenance.read.${this.name}`, (options) => {
            options.callback?.(this.toJSON());
        });
    }

    async loadTrackerData()
    {
        const doc = await MaintenanceModel.findOne({ name: this.name });

        if(!doc)
        {
            LoggerInstance.error(`Maintenance-${this.name}: Tracker does not exists.`);
            return;
        }
        else if(doc.duration === undefined)
        {
            doc.duration = 0;
            doc.save();
        }

        this.duration = doc.duration;
    }

    /** Append duration to this task */
    async append(appendValue: number)
    {
        const document = await MaintenanceModel.findOneAndUpdate({ name: this.name }, {$inc: {"duration": appendValue }});

        if(document)
            this.duration += appendValue;
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
            LoggerInstance.info(`Maintenance: Cleared maintenance task ${this.name}.`);
        }
        else
            LoggerInstance.error(`Maintenance: Failed to update ${this.name} document.`);
    }

    /** Compute the task actual progress */
    get computeDurationProgress(): number
    {
        return Math.floor((this.duration / this.durationLimit) * 10) / 10;
    }

    toJSON(): MaintenanceHydrated
    {
        return { 
            name: this.name,
            durationType: this.durationType,
            duration: Math.floor(this.duration * 100) / 100,
            durationMax: this.durationLimit,
            durationProgress: this.computeDurationProgress
        }
    }
}