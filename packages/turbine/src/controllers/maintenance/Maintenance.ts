import { ISocketMaintenance } from "@metalizzsas/nuster-typings/build/exchanged/maintenance";
import { IConfigMaintenance, IMaintenanceProcedure } from "@metalizzsas/nuster-typings/build/spec/maintenance";
import { LoggerInstance } from "../../app";
import { MaintenanceModel } from "./MaintenanceModel";

export class Maintenance implements IConfigMaintenance
{
    name: string;

    durationType: string;
    durationLimit: number;
    duration: number; //Actual duration got by reading data from mongoose
    durationProgress: number; //Actual progress as a percentage, got by calculating form mongoose

    operationDate?: number;

    procedure?: IMaintenanceProcedure;

    constructor(obj: IConfigMaintenance)
    {
        this.name = obj.name

        this.durationType = obj.durationType;
        this.durationLimit = obj.durationLimit;
        this.duration = 0;
        this.durationProgress = 0;

        this.procedure = obj.procedure;

        this.refresh();
    }

    async refresh()
    {
        const doc = await MaintenanceModel.findOne({ name: this.name });

        if(doc != null)
        {
            //TODO fixme
            this.duration = doc.duration ?? 0;
            this.operationDate = doc.operationDate;

            this.durationProgress = Math.floor((this.duration / this.durationLimit));
        }
        else
        {
            LoggerInstance.warn(`Maintenance: Document tracker for maintenance ${this.name} does not exists.`);
            await MaintenanceModel.create({ name: this.name, duration: 0 })
        }
    }

    async append(value: number)
    {
        const document = await MaintenanceModel.findOneAndUpdate({name: this.name}, {$inc: {duration: value}});

        if(document)
            await this.refresh();
        else
            LoggerInstance.warn("Maintenance: Failed to append data to " + this.name + " tracker.");
    }

    async reset()
    {
        MaintenanceModel.findOneAndUpdate({ name: this.name }, { duration: 0, operationDate: Date.now() }, (err: Error) => {
            if(err != undefined)
            {
                LoggerInstance.error(`Maintenance: Failed to update ${this.name} document.`);
            }
            else
            {
                this.refresh();
            }
        });
    }

    toJSON(): ISocketMaintenance
    {
        return {
            name: this.name,

            duration: this.duration,
            durationType: this.durationType,
            durationLimit: this.durationLimit,
            durationActual: Math.floor(this.duration),
            durationProgress: this.durationProgress,

            operationDate: this.operationDate || undefined,

            procedure: this.procedure
        }
    }
}