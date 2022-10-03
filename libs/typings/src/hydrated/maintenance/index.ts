import { IConfigMaintenance } from "../../spec/maintenance";

export type IMaintenanceHydrated = IConfigMaintenance & IMaintenanceStored & { durationActual: number, durationProgress: number };

/** Maintenance task object stored in database */
export interface IMaintenanceStored extends Omit<IConfigMaintenance, "durationType" | "durationLimit" | "procedure">
{
    /** Maintenance task duration */
    duration: number;
    /** Last operation date */
    operationDate?: number;
}