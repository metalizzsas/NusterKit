import { LoggerInstance } from "../app";
import { Maintenance } from "./Maintenance";

import type { CountableMaintenance as CountableMaintenanceConfig } from "@metalizzsas/nuster-typings/build/spec/maintenances";
import type { MaintenanceHydrated } from "@metalizzsas/nuster-typings/build/hydrated/maintenance";
import { TurbineEventLoop } from "../events";
import { prisma } from "../db";

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

        TurbineEventLoop.on(`maintenance.append.${this.name}`, (value) => {
            this.append(value);
        });
    }

    async loadTrackerData()
    {
        const maintenance = await prisma.maintenance.findUnique({ where: { name: this.name } });

        if(maintenance === null)
        {
            LoggerInstance.error(`Maintenance-${this.name}: Tracker does not exists.`);
            return;
        }
        else if(maintenance.duration === undefined)
        {
            maintenance.duration = 0;
            await prisma.maintenance.update({ where: { name: this.name }, data: { duration: 0 } });
        }

        this.duration = maintenance.duration ?? 0;
    }

    /** Append duration to this task */
    async append(appendValue: number)
    {
        const document = await prisma.maintenance.update({ where: { name: this.name }, data: { duration: { increment: appendValue } }});

        if(document)
            this.duration += appendValue;
        else
            LoggerInstance.warn("Maintenance: Failed to append data to " + this.name + " tracker.");
    }

    /** Compute the task actual progress */
    get computeDurationProgress(): number
    {
        return Math.floor((this.duration / this.durationLimit) * 10) / 10;
    }

    /** Reset maintenance task */
    async reset()
    {
        const document = await super.resetTracker();
        this.operationDate = document.operationDate ?? undefined;
        this.duration = 0;
    }

    toJSON(): MaintenanceHydrated
    {
        return { 
            name: this.name,
            durationType: this.durationType,
            duration: Math.floor(this.duration * 100) / 100,
            durationMax: this.durationLimit,
            durationProgress: this.computeDurationProgress,
            operationDate: this.operationDate,
        }
    }
}