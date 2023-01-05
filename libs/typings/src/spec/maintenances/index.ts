/** Maintenance configuration base object */
interface BaseMaintenance
{
    /** Maintenance task name */
    name: string;

    /** Duration type of this maintenance task */
    durationType: "cycle" | "duration" | "sensor";

    /** Last operation date */
    operationDate?: number;
}

/** Maintenance Task that is incremental */
interface CountableMaintenance extends BaseMaintenance
{
    durationType: "cycle" | "duration";

    /** When this duration is reached maitnenance is due */
    durationLimit: number;
}

/** Maintenance tasks that depends on a sensor value */
interface SensorMaintenance extends BaseMaintenance
{
    durationType: "sensor";

    /** When this value is reached on sensor maintenance is due */
    sensorLimitValue: number;
    /** When this value is reached on sensor means that maintenance task has been done */
    sensorBaseValue: number;

    /** Sensor gate to check */
    sensorGate: string;
    /** Gate needed to check maitnenance task */
    requireEnableGate?: string;
}

/** All Maintenances types */
type Maintenances = (SensorMaintenance | CountableMaintenance) & BaseMaintenance;

export { Maintenances, BaseMaintenance, SensorMaintenance, CountableMaintenance };