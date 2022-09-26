import { ParameterBlock } from ".";
import { ProgramBlockRunner } from "../ProgramBlockRunner";
import { IMaintenanceParameterBlock } from "../../interfaces/programblocks/ParameterBlocks/IMaintenanceParameterBlock";

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
        return this.pbrInstance.machine.maintenanceController.tasks.find(t => t.name == this.value)?.durationProgress ?? 0;
    }
}

