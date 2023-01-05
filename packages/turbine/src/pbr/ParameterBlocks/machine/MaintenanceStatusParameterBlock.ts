import { StatusParameterBlockHydrated, type StringParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllParameterBlocks, MaintenanceStatusParameterBlock as MaintenanceStatusParameterBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlockRegistry";
import { TurbineEventLoop } from "../../../events";
import type { MaintenanceHydrated } from "@metalizzsas/nuster-typings/build/hydrated/maintenance";

export class MaintenanceStatusParameterBlock extends StatusParameterBlockHydrated
{
    private taskName: StringParameterBlockHydrated;
    #maintenanceTask?: MaintenanceHydrated;

    constructor(obj: MaintenanceStatusParameterBlockSpec)
    {
        super(obj);
        this.taskName = ParameterBlockRegistry.String(obj.maintenance_status);

        TurbineEventLoop.on(`maintenance.updated.${this.taskName.data}`, (maintenance) => { this.#maintenanceTask = maintenance; });
        TurbineEventLoop.emit(`maintenance.read.${this.taskName.data}`, {callback: (maintenance) => {
            this.#maintenanceTask = maintenance;
        }});
    }

    public get data(): "error" | "warning" | "good"
    {
        if(this.#maintenanceTask === undefined)
            return "error";

        return this.#maintenanceTask.durationProgress < 0.75 ? "good" : this.#maintenanceTask.durationProgress > 1 ? "error" : "warning";
    }

    static isMaintenanceStatusPB(obj: AllParameterBlocks): obj is MaintenanceStatusParameterBlockSpec
    {
        return (obj as MaintenanceStatusParameterBlockSpec).maintenance_status !== undefined;
    }
}