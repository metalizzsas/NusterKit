import type { IMaintenanceProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/IMaintenanceProgramBlock";
import type { CountableMaintenance } from "../../controllers/maintenance/CountableMaintenance";
import { MaintenanceController } from "../../controllers/maintenance/MaintenanceController";
import type { NumericParameterBlocks, StringParameterBlocks } from "../ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";
import { ProgramBlock } from "./index";

export class MaintenanceProgramBlock extends ProgramBlock implements IMaintenanceProgramBlock
{
    name = "maintenance" as const;

    params: [StringParameterBlocks, NumericParameterBlocks];

    constructor(obj: IMaintenanceProgramBlock) {
        super(obj);

        this.params = [
            ParameterBlockRegistry(obj.params[0]) as StringParameterBlocks,
            ParameterBlockRegistry(obj.params[1]) as NumericParameterBlocks
        ];
    }

    public async execute(): Promise<void> {
        const maintenanceName = this.params[0].data();
        const maintenanceValue = this.params[1].data();

        const maintenanceTask = MaintenanceController.getInstance().tasks.find((m) => m.name == maintenanceName) as CountableMaintenance | undefined;

        if (maintenanceTask) {
            maintenanceTask.append(maintenanceValue);
        }
        this.executed = true;

    }
}

