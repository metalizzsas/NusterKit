import { IMaintenanceProgramBlock } from "@metalizz/nuster-typings/src/spec/cycle/programblocks/ProgramBlocks/IMaintenanceProgramBlock";
import { MaintenanceController } from "../../controllers/maintenance/MaintenanceController";
import { NumericParameterBlocks, StringParameterBlocks } from "../ParameterBlocks";
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
            ParameterBlockRegistry(obj.params[0]) as NumericParameterBlocks
        ];
    }

    public async execute(): Promise<void> {
        const maintenanceName = this.params[0].data();
        const maintenanceValue = this.params[1].data();

        const maintenanceTask = MaintenanceController.getInstance().tasks.find((m) => m.name == maintenanceName);

        if (maintenanceTask) {
            maintenanceTask.append(maintenanceValue);
        }
        this.executed = true;

    }
}

