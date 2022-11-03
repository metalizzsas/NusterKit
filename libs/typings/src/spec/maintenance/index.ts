import { ICountableMaintenance } from "./CountableMaintenance";
import { ISensorMaintenance } from "./SensorMaintenance";

/** Maintenance configuration base object */
export interface IBaseMaintenance
{
    /** Maintenance task name */
    name: string;
    /** Duration type of this maintenance task */
    durationType: "cycle" | "duration" | "sensor";

    /** Last operation date */
    operationDate?: number;
    /** Maintenance procedure */
    procedure?: IMaintenanceProcedure;
}

/** All maintenance types export */
export type IConfigMaintenance = IBaseMaintenance & (ISensorMaintenance | ICountableMaintenance);

export interface IMaintenanceProcedure
{
    /** Procedure Tools used */
    tools: string[];
    /** Array of procedure steps */
    steps: IMaintenanceProcedureStep[]
}

export interface IMaintenanceProcedureStep
{
    /** Procedure step name */
    name: string;
    /** Procedure step media array */
    media: string[]
}