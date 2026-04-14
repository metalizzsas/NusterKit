import { Router } from "./Router";

import type { MaintenanceHydrated } from "../types/hydrated/maintenance";
import type { Maintenances } from "../types/spec/maintenances";

import { CountableMaintenance } from "../maintenance/CountableMaintenance";
import { SensorMaintenance } from "../maintenance/SensorMaintenance";

export class MaintenanceRouter extends Router
{
    public tasks: (CountableMaintenance | SensorMaintenance)[] = []

    constructor(maintenanceTasks: Maintenances[])
    {
        super();

        const tasks: Array<Maintenances> = [...maintenanceTasks, { name: "cycleCount", durationType: 'cycle', durationLimit: Number.MAX_VALUE }];

        for(const task of tasks)
        {
            switch(task.durationType)
            {
                case "sensor": this.tasks.push(new SensorMaintenance(task)); break;
                default: this.tasks.push(new CountableMaintenance(task)); break;
            }
        }
    }

    public socketData(): MaintenanceHydrated[]
    {
        return this.tasks.map(k => k.toJSON());
    }
}