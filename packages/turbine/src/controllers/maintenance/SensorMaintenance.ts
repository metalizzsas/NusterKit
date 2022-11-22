import type { IMaintenanceHydrated } from "@metalizzsas/nuster-typings/build/hydrated/maintenance";
import type { IOGates } from "@metalizzsas/nuster-typings/build/spec/iogates";
import type { ISensorMaintenance } from "@metalizzsas/nuster-typings/build/spec/maintenance/SensorMaintenance";
import { LoggerInstance } from "../../app";
import { map } from "../../map";
import { IOController } from "../io/IOController";
import { Maintenance } from "./Maintenance";
import { MaintenanceModel } from "./MaintenanceModel";

export class SensorMaintenance extends Maintenance implements Omit<ISensorMaintenance, "sensorGate" | "requireEnabledGate">
{
    durationType = "sensor" as const;

    sensorLimitValue: number;
    sensorBaseValue: number;

    sensorGate: IOGates;
    requireEnabledGate?: IOGates;

    constructor(obj: ISensorMaintenance)
    {
        super(obj);

        this.sensorBaseValue = obj.sensorBaseValue;
        this.sensorLimitValue = obj.sensorLimitValue;

        //Fill gates
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.sensorGate = IOController.getInstance().gFinder(obj.sensorGate)!;

        if(obj.requireEnableGate)
            this.requireEnabledGate = IOController.getInstance().gFinder(obj.requireEnableGate);

        super.checkTracker();
    }

    get computeDurationProgress(): number {

        if(this.requireEnabledGate?.value == 0)
            return -1;
        
        return Math.floor(map(this.sensorGate.value, this.sensorBaseValue, this.sensorLimitValue, 0, 1));
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

    toJSON(): IMaintenanceHydrated {
        return {
            name: this.name,
            durationType: this.durationType,
            duration: this.sensorGate.value,
            durationMax: this.sensorLimitValue,
            durationProgress: this.computeDurationProgress
        }
    }
}