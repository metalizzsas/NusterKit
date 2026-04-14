import type { MaintenanceBus } from "./interfaces";
import type { CountableMaintenance } from "../maintenance/CountableMaintenance";
import type { SensorMaintenance } from "../maintenance/SensorMaintenance";
import type { MaintenanceHydrated } from "$types/hydrated/maintenance";
import { TurbineEventLoop } from "../events";

/**
 * MaintenanceBus adapter — wraps maintenance task instances and provides
 * direct read/append access instead of event-based communication.
 */
export class MaintenanceBusAdapter implements MaintenanceBus {
	private tasks: (CountableMaintenance | SensorMaintenance)[];

	constructor(tasks: (CountableMaintenance | SensorMaintenance)[]) {
		this.tasks = tasks;
	}

	read(taskName: string): MaintenanceHydrated | undefined {
		const task = this.tasks.find(t => t.name === taskName);
		return task?.toJSON();
	}

	append(taskName: string, value: number): void {
		const task = this.tasks.find(t => t.name === taskName);
		if (task && "append" in task) {
			(task as CountableMaintenance).append(value);
		}
	}

	// Transition bridge
	on(event: `updated.${string}`, listener: (m: MaintenanceHydrated) => void): void {
		const taskName = event.replace("updated.", "");
		TurbineEventLoop.on(`maintenance.updated.${taskName}`, listener);
	}

	off(event: `updated.${string}`, listener: (m: MaintenanceHydrated) => void): void {
		const taskName = event.replace("updated.", "");
		TurbineEventLoop.removeListener(`maintenance.updated.${taskName}`, listener);
	}
}
