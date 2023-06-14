type BaseMaintenanceHydrated = {

    name: string; //Maintenance task name

    duration: number; // Actual value
    durationMax: number; // Maximum value

    durationProgress: number; // Float value 0-1
}

type CountableMaintenance = {
    durationType: "cycle" | "duration"
}

type SensorMaintenance = {
    durationType: "sensor";

    sensorUnit?: string;
}

export type MaintenanceHydrated = BaseMaintenanceHydrated & (CountableMaintenance | SensorMaintenance)