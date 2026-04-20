import type { IOGateJSON } from "$types/hydrated/io";
import type { MaintenanceHydrated } from "$types/hydrated/maintenance";
import type { SensorMaintenance as SensorMaintenanceConfig } from "$types/spec/maintenances";
import { prisma } from "../db";
import { TurbineEventLoop } from "../events";
import { map } from "../utils/map";
import { Maintenance } from "./maintenance";

export class SensorMaintenance extends Maintenance implements Omit<SensorMaintenanceConfig, "sensorGate" | "requireEnabledGate"> {
	durationType = "sensor" as const;

	sensorLimitValue: number;
	sensorBaseValue: number;

	#requireEnabledGate?: IOGateJSON;
	#sensorGate?: IOGateJSON;

	#lastKnownDurationProgress = -1;
	#lastEmittedProgress = -1;

	constructor(obj: SensorMaintenanceConfig) {
		super(obj);

		this.sensorBaseValue = obj.sensorBaseValue;
		this.sensorLimitValue = obj.sensorLimitValue;

		TurbineEventLoop.on(`io.updated.${obj.sensorGate}`, (gate) => {
			this.#sensorGate = gate;
			const new_progress = Math.round(this.computeDurationProgress * 10) / 10;
			if (new_progress !== this.#lastEmittedProgress) {
				this.#lastEmittedProgress = new_progress;
				TurbineEventLoop.emit("ws.dirty", "maintenance");
			}
		});

		if (obj.requireEnableGate) TurbineEventLoop.on(`io.updated.${obj.requireEnableGate}`, (gate) => (this.#requireEnabledGate = gate));

		TurbineEventLoop.on(`maintenance.read.${this.name}`, (options) => {
			options.callback?.(this.toJSON());
		});

		super
			.check_tracker()
			.then((k) => (this.#lastKnownDurationProgress = k ?? -1))
			.catch((err) => {
				TurbineEventLoop.emit("log", "error", `Maintenance-${this.name}: check_tracker failed: ${(err as Error).message}`);
			});
	}

	get computeDurationProgress(): number {
		if (this.#requireEnabledGate?.value !== 1) return this.#lastKnownDurationProgress;

		if (this.#sensorGate === undefined) return this.#lastKnownDurationProgress;

		this.#lastKnownDurationProgress = map(this.#sensorGate.value, this.sensorBaseValue, this.sensorLimitValue, 0, 100) / 100;
		prisma.maintenance.update({ where: { name: this.name }, data: { duration: this.#lastKnownDurationProgress } }).catch((err) => {
			TurbineEventLoop.emit("log", "error", `Maintenance-${this.name}: duration update failed: ${(err as Error).message}`);
		});

		return this.#lastKnownDurationProgress;
	}

	/** Reset maintenance task */
	async reset() {
		const document = await super.reset_tracker();
		this.operationDate = document.operationDate ?? undefined;
		TurbineEventLoop.emit("ws.dirty", "maintenance");
	}

	toJSON(): MaintenanceHydrated {
		return {
			name: this.name,
			durationType: this.durationType,
			duration: this.#requireEnabledGate?.value === 1 ? (this.#sensorGate?.value ?? -1) : -1,
			durationMax: this.sensorLimitValue,
			durationProgress: this.computeDurationProgress,
			sensorUnit: this.#sensorGate?.unity,
			operationDate: this.operationDate,
		};
	}
}
