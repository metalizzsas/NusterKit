import { TurbineEventLoop } from "../events";
import { CountableMaintenance } from "../maintenance/countable-maintenance";
import { SensorMaintenance } from "../maintenance/sensor-maintenance";
import type { MaintenanceBus } from "../services/interfaces";
import type { MaintenanceHydrated } from "../types/hydrated/maintenance";
import type { Maintenances } from "../types/spec/maintenances";

export class MaintenanceRouter implements MaintenanceBus {
	public tasks: (CountableMaintenance | SensorMaintenance)[] = [];

	constructor(maintenance_tasks: Maintenances[]) {
		const tasks: Array<Maintenances> = [...maintenance_tasks, { name: "cycleCount", durationType: "cycle", durationLimit: Number.MAX_VALUE }];

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

	public socket_data(): MaintenanceHydrated[] {
		return this.tasks.map((k) => k.toJSON());
	}

	// --- MaintenanceBus interface implementation ---

	read(task_name: string): MaintenanceHydrated | undefined {
		const task = this.tasks.find((t) => t.name === task_name);
		return task?.toJSON();
	}

	append(task_name: string, value: number): void {
		const task = this.tasks.find((t) => t.name === task_name);
		if (task && "append" in task) {
			(task as CountableMaintenance).append(value);
		}
	}

	on(event: `updated.${string}`, listener: (m: MaintenanceHydrated) => void): void {
		const task_name = event.replace("updated.", "");
		TurbineEventLoop.on(`maintenance.updated.${task_name}`, listener);
	}

	off(event: `updated.${string}`, listener: (m: MaintenanceHydrated) => void): void {
		const task_name = event.replace("updated.", "");
		TurbineEventLoop.removeListener(`maintenance.updated.${task_name}`, listener);
	}
}
