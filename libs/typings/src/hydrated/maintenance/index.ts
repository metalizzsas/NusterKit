import type { IBaseMaintenance } from "../../spec/maintenance";

export type IMaintenanceHydrated = {

    name: string;

    durationType: IBaseMaintenance["durationType"];

    duration: number; // Actual value
    durationMax: number; // Maximum value

    durationProgress: number; // Float value 0-1
}

/** Maintenance task object stored in database */
export interface IMaintenanceStored
{
    /** Maintenance task name */
    name: string;
    /** Maintenance task duration */
    duration: number;
    /** Last operation date */
    operationDate?: number;
}