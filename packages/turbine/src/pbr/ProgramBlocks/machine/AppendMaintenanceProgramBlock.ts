import type { NumericParameterBlockHydrated, StringParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import { ProgramBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ProgramBlockHydrated";
import type { AllProgramBlocks, AppendMaintenanceProgramBlock as AppendMaintenanceProgramBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/IProgramBlocks";
import type { CountableMaintenance } from "../../../controllers/maintenance/CountableMaintenance";
import { MaintenanceController } from "../../../controllers/maintenance/MaintenanceController";
import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";

export class AppendMaintenanceProgramBlock extends ProgramBlockHydrated
{
    taskName: StringParameterBlockHydrated;
    taskValue: NumericParameterBlockHydrated;

    constructor(obj: AppendMaintenanceProgramBlockSpec) {
        super(obj);
        this.taskName = ParameterBlockRegistry.String(obj.append_maintenance[0]);
        this.taskValue = ParameterBlockRegistry.Numeric(obj.append_maintenance[1]);
    }

    public async execute(): Promise<void> {
        const maintenanceName = this.taskName.data;
        const maintenanceValue = this.taskValue.data;

        //TODO: Change to avoid singleton instance
        const maintenanceTask = MaintenanceController.getInstance().tasks.find((m) => m.name == maintenanceName) as CountableMaintenance | undefined;

        if (maintenanceTask) {
            maintenanceTask.append(maintenanceValue);
        }
        super.execute();
    }

    static isAppendMaintenancePgB(obj: AllProgramBlocks): obj is AppendMaintenanceProgramBlockSpec
    {
        return (obj as AppendMaintenanceProgramBlockSpec).append_maintenance !== undefined;
    }
}