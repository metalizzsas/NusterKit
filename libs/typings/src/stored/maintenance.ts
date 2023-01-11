/** Maintenance task object stored in database */
export type MaintenanceStored = {
    /** Maintenance task name */
    name: string;
    /** Maintenance task duration */
    duration: number;
    /** Last operation date */
    operationDate?: number;
}