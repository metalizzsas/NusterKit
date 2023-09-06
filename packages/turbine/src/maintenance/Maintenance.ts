import type { BaseMaintenance } from "@metalizzsas/nuster-typings/build/spec/maintenances";
import { LoggerInstance } from "../app";
import { prisma } from "../db";
import type { Maintenance as MaintenancePrisma } from "@prisma/client";

export class Maintenance implements BaseMaintenance
{
    name: string;

    durationType: "cycle" | "duration" | "sensor";

    operationDate?: Date;

    constructor(obj: BaseMaintenance)
    {
        this.name = obj.name
        this.durationType = obj.durationType;
    }

    async checkTracker(): Promise<number | void>
    {
        const maintenance = await prisma.maintenance.findUnique({ where: { name: this.name } });

        if(maintenance !== null)
        {
            this.operationDate = maintenance.operationDate ?? undefined;
            return maintenance.duration;
        }
        
        LoggerInstance.warn(`Maintenance-${this.name}: Maintenance tracker not found, creating it...`);
        await prisma.maintenance.create({ data: {
            name: this.name,
            duration: 0
        }});
    }

    /** Reset maintenance task */
    async resetTracker(): Promise<MaintenancePrisma>
    {
        const document = await prisma.maintenance.update({ where: { name: this.name }, data: { duration: 0, operationDate: new Date() } });

        if(document)
        {
            this.operationDate = document.operationDate ?? undefined;
            LoggerInstance.info(`Maintenance: Cleared maintenance task ${this.name}.`);
            return document;
        }
        else
        {
            LoggerInstance.error(`Maintenance: Failed to update ${this.name} document.`);
            throw new Error("Failed to update document.");
        }
    }
}