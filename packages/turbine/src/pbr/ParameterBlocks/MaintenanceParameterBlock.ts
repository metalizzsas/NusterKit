import { IMaintenanceParameterBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ParameterBlocks/IMaintenanceParameterBlock";
import { ParameterBlock } from ".";
import { MaintenanceController } from "../../controllers/maintenance/MaintenanceController";

export class MaintenanceProgressParameterBlock extends ParameterBlock implements IMaintenanceParameterBlock
{
    name = "maintenance" as const;
    value: string;

    constructor(obj: IMaintenanceParameterBlock)
    {
        super(obj);

        this.value = obj.value;
    }

    public data(): number {
        return MaintenanceController.getInstance().tasks.find(t => t.name == this.value)?.durationProgress ?? 0;
    }
}

