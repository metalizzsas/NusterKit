import { ParameterBlock } from ".";
import { ProgramBlockRunner } from "../ProgramBlockRunner";
import { IMaintenanceParameterBlock } from "../../interfaces/programblocks/ParameterBlocks/IMaintenanceParameterBlock";
import { MaintenanceController } from "../../controllers/maintenance/MaintenanceController";

export class MaintenanceProgressParameterBlock extends ParameterBlock implements IMaintenanceParameterBlock
{
    name = "maintenance" as const;
    value: string;

    constructor(instance: ProgramBlockRunner, obj: IMaintenanceParameterBlock)
    {
        super(instance);

        this.value = obj.value;
    }

    public data(): number {
        return MaintenanceController.getInstance().tasks.find(t => t.name == this.value)?.durationProgress ?? 0;
    }
}

