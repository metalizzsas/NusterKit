
import { ProgramBlockRunner } from "../ProgramBlockRunner";
import { IMaintenanceProgramBlock } from "../../interfaces/programblocks/ProgramBlocks/IMaintenanceProgramBlock";
import { ProgramBlock } from "./index";
import { StringParameterBlocks, NumericParameterBlocks } from "../ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";

export class MaintenanceProgramBlock extends ProgramBlock implements IMaintenanceProgramBlock
{
    name = "maintenance" as const;

    params: [StringParameterBlocks, NumericParameterBlocks];

    constructor(pbrInstance: ProgramBlockRunner, obj: IMaintenanceProgramBlock) {
        super(pbrInstance, obj);

        this.params = [
            ParameterBlockRegistry(pbrInstance, obj.params[0]) as StringParameterBlocks,
            ParameterBlockRegistry(pbrInstance, obj.params[0]) as NumericParameterBlocks
        ];
    }

    public async execute(): Promise<void> {
        const mN = this.params[0].data();
        const mV = this.params[1].data();

        const m = this.pbrInstance.machine.maintenanceController.tasks.find((m) => m.name == mN);

        if (m) {
            m.append(mV);
        }
        this.executed = true;

    }
}

