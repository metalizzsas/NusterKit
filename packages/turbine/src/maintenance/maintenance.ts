import type { BaseMaintenance } from "$types/spec/maintenances";
import { prisma } from "../db";
import type { Maintenance as MaintenancePrisma } from "@prisma/client";
import { TurbineEventLoop } from "../events";

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
        
        TurbineEventLoop.emit('log', 'warning', `Maintenance-${this.name}: Maintenance tracker not found, creating it...`);
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
            TurbineEventLoop.emit('log', 'info', `Maintenance: Cleared maintenance task ${this.name}.`);
            return document;
        }
        else
        {
             TurbineEventLoop.emit('log', 'error', `Maintenance: Failed to update ${this.name} document.`);
            throw new Error("Failed to update document.");
        }
    }
}