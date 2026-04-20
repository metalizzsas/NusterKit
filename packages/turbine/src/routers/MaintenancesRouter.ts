import { TurbineEventLoop } from "../events";
import { CountableMaintenance } from "../maintenance/CountableMaintenance";
import { SensorMaintenance } from "../maintenance/SensorMaintenance";
import type { MaintenanceBus } from "../services/interfaces";
import type { MaintenanceHydrated } from "../types/hydrated/maintenance";
import type { Maintenances } from "../types/spec/maintenances";

export class MaintenanceRouter implements MaintenanceBus {
	public tasks: (CountableMaintenance | SensorMaintenance)[] = [];

	constructor(maintenanceTasks: Maintenances[]) {
		const tasks: Array<Maintenances> = [...maintenanceTasks, { name: "cycleCount", durationType: "cycle", durationLimit: Number.MAX_VALUE }];

		for (const task of tasks) {
			switch (task.durationType) {
				case "sensor":
					this.tasks.push(new SensorMaintenance(task));
					break;
				default:
					this.tasks.push(new CountableMaintenance(task));
					break;
			}
		}
	}

	public socketData(): MaintenanceHydrated[] {
		return this.tasks.map((k) => k.toJSON());
	}

	// --- MaintenanceBus interface implementation ---

	read(taskName: string): MaintenanceHydrated | undefined {
		const task = this.tasks.find((t) => t.name === taskName);
		return task?.toJSON();
	}

	append(taskName: string, value: number): void {
		const task = this.tasks.find((t) => t.name === taskName);
		if (task && "append" in task) {
			(task as CountableMaintenance).append(value);
		}
	}

	on(event: `updated.${string}`, listener: (m: MaintenanceHydrated) => void): void {
		const taskName = event.replace("updated.", "");
		TurbineEventLoop.on(`maintenance.updated.${taskName}`, listener);
	}

	off(event: `updated.${string}`, listener: (m: MaintenanceHydrated) => void): void {
		const taskName = event.replace("updated.", "");
		TurbineEventLoop.removeListener(`maintenance.updated.${taskName}`, listener);
	}
}
