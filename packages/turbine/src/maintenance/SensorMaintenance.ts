import { LoggerInstance } from "../app";
import { map } from "../utils/map";
import { Maintenance } from "./Maintenance";
import { MaintenanceModel } from "../models/MaintenanceModel";
import type { SensorMaintenance as SensorMaintenanceConfig } from "@metalizzsas/nuster-typings/build/spec/maintenances";
import type { MaintenanceHydrated } from "@metalizzsas/nuster-typings/build/hydrated/maintenance";
import { TurbineEventLoop } from "../events";
import type { IOGateJSON } from "@metalizzsas/nuster-typings/build/hydrated/io";

export class SensorMaintenance extends Maintenance implements Omit<SensorMaintenanceConfig, "sensorGate" | "requireEnabledGate">
{
    durationType = "sensor" as const;

    sensorLimitValue: number;
    sensorBaseValue: number;

    #requireEnabledGate?: IOGateJSON;
    #sensorGate?: IOGateJSON;

    #lastKnownDurationProgress = -1;

    constructor(obj: SensorMaintenanceConfig)
    {
        super(obj);

        this.sensorBaseValue = obj.sensorBaseValue;
        this.sensorLimitValue = obj.sensorLimitValue;

        TurbineEventLoop.on(`io.updated.${obj.sensorGate}`, (gate) => { this.#sensorGate = gate});

        if(obj.requireEnableGate)
            TurbineEventLoop.on(`io.updated.${obj.requireEnableGate}`, (gate) => this.#requireEnabledGate = gate);

        TurbineEventLoop.on(`maintenance.read.${this.name}`, (options) => {
            options.callback?.(this.toJSON());
        });

        super.checkTracker();
    }

    get computeDurationProgress(): number
    {
        if(this.#requireEnabledGate?.value !== 1)
            return this.#lastKnownDurationProgress;

        if(this.#sensorGate === undefined)
            return this.#lastKnownDurationProgress;

        this.#lastKnownDurationProgress = map(this.#sensorGate.value, this.sensorBaseValue, this.sensorLimitValue, 0, 100) / 100;
        MaintenanceModel.findOneAndUpdate({ name: this.name }, { duration: this.#lastKnownDurationProgress });
        
        return this.#lastKnownDurationProgress;
    }

    /** Reset maintenance task */
    async reset()
    {
        const document = await MaintenanceModel.findOneAndUpdate({ name: this.name }, { duration: 0, operationDate: Date.now() });

        if(document)
        {
            this.operationDate = document.operationDate;
        }
        else
            LoggerInstance.error(`Maintenance-${this.name}: Failed to update tracker.`);
    }

    toJSON(): MaintenanceHydrated {
        return {
            name: this.name,
            durationType: this.durationType,
            duration: (this.#requireEnabledGate?.value === 1 ? this.#sensorGate?.value ?? -1 : -1),
            durationMax: this.sensorLimitValue,
            durationProgress: this.computeDurationProgress,
            sensorUnit: this.#sensorGate?.unity
        }
    }
}