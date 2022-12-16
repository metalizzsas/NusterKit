import { StatusParameterBlockHydrated, type StringParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllParameterBlocks, MaintenanceStatusParameterBlock as MaintenanceStatusParameterBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/IParameterBlocks";
import { MaintenanceController } from "../../../controllers/maintenance/MaintenanceController";
import { ParameterBlockRegistry } from "../ParameterBlockRegistry";

export class MaintenanceStatusParameterBlock extends StatusParameterBlockHydrated
{
    private taskName: StringParameterBlockHydrated;

    constructor(obj: MaintenanceStatusParameterBlockSpec)
    {
        super(obj);
        this.taskName = ParameterBlockRegistry.String(obj.maintenance_status);
    }

    public get data(): "error" | "warning" | "good"
    {
        const taskName = this.taskName.data;
        const task = MaintenanceController.getInstance().tasks.find(t => t.name == taskName);

        if(task === undefined)
            return "error";

        const duration = task.computeDurationProgress;
        
        return duration < 0.75 ? "good" : duration > 1 ? "error" : "warning";
    }

    static isMaintenanceStatusPB(obj: AllParameterBlocks): obj is MaintenanceStatusParameterBlockSpec
    {
        return (obj as MaintenanceStatusParameterBlockSpec).maintenance_status !== undefined;
    }
}