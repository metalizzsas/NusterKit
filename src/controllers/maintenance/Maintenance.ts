import { LoggerInstance } from "../../app";
import { IConfigMaintenance, IMaintenanceProcedure } from "../../interfaces/IMaintenance";
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
        this.durationLimit = obj.durationLimit
        this.duration = 0;
        this.durationProgress = 0;

        this.procedure = obj.procedure;

        this.refresh();
    }

    async refresh()
    {
        const doc = await MaintenanceModel.findOne({ name: this.name });

        if(doc != undefined)
        {
            this.duration = doc.duration ?? 0;
            this.durationProgress = Math.floor((this.duration / this.durationLimit));
            this.operationDate = doc.operationDate
        }
        else
        {
            LoggerInstance.warn(`Maintenance: Document tracker for maintenance ${this.name} does not exists.`);
            await MaintenanceModel.create({ name: this.name, duration: 0 })
        }
    }

    async append(value: number)
    {
        const doc = await MaintenanceModel.findOne({name: this.name});

        if(doc)
        {
            await MaintenanceModel.findOneAndUpdate({name: this.name}, {$inc: {"duration": value}});
            await this.refresh();
        }
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

    toJSON()
    {
        return {
            name: this.name,

            durationType: this.durationType,
            durationLimit: this.durationLimit,
            durationActual: Math.floor(this.duration),
            durationProgress: this.durationProgress,

            operationDate: this.operationDate || undefined,

            procedure: this.procedure
        }
    }
}