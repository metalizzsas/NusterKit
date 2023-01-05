import type { BaseMaintenance } from "../../spec/maintenances";

export type MaintenanceHydrated = {

    name: string;

    durationType: BaseMaintenance["durationType"]

    duration: number; // Actual value
    durationMax: number; // Maximum value

    durationProgress: number; // Float value 0-1
}