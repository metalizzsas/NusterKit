import {Schema, model} from "mongoose";

interface IMaintenance
{
    name: string;
    duration: number;
    operationDate?: number;
}

var MaintenanceSchema = new Schema<IMaintenance>({
    name: { type: String, required: true }, //maintenance name
    duration: { type: Number, required: true }, // maitenance current duration
    operationDate: Number, // last maintenance operation date
});

const MaintenanceModel = model<IMaintenance>("Maintenance", MaintenanceSchema);

export class Maintenance
{
    name: string;

    durationType: string;
    durationLimit: number;
    durationActual: number; //Actual duration got by reading data from mongoose
    durationProgress: number; //Actual progress as a percentage, got by calculating form mongoose

    operationDate?: number;

    procedure: IMaintenanceProcedure;

    constructor(name: string, durationType: string, durationLimit: number, procedure: IMaintenanceProcedure)
    {
        this.name = name;

        this.durationType = durationType;
        this.durationLimit = durationLimit;
        this.durationActual = 0;
        this.durationProgress = 0;

        this.procedure = procedure;

        this.refresh();
    }

    async refresh()
    {
        let doc = await MaintenanceModel.findOne({ name: this.name });

        if(doc != undefined)
        {
            this.durationActual = doc.duration;
            this.durationProgress = Math.floor((this.durationActual / this.durationLimit) * 100) / 100;
            this.operationDate = doc.operationDate
        }
        else
        {
            console.log(`Document tracker for maintenance ${this.name} does not exists`);
            await MaintenanceModel.create({ name: this.name, duration: 0 })
        }
    }

    async reset()
    {
        MaintenanceModel.findOneAndUpdate({ name: this.name }, { duration: 0, operationDate: Date.now() }, (err: Error) => {
            if(err != undefined)
            {
                console.log("failed to update MaintenanceTask");
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
            durationActual: this.durationActual,
            durationProgress: this.durationProgress,

            operationDate: this.operationDate || undefined,

            procedure: this.procedure
        }
    }
}

interface IMaintenanceProcedure
{
    desc: string;
    steps: IMaintenanceProcedureStep[]
}

interface IMaintenanceProcedureStep
{
    name: string;
    images: string[];
}