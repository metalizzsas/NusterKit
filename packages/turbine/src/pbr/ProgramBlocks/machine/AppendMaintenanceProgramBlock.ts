import type { NumericParameterBlockHydrated, StringParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllProgramBlocks, AppendMaintenanceProgramBlock as AppendMaintenanceProgramBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ProgramBlocks";
import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";
import { TurbineEventLoop } from "../../../events";
import { ProgramBlock } from "../ProgramBlock";

export class AppendMaintenanceProgramBlock extends ProgramBlock
{
    taskName: StringParameterBlockHydrated;
    taskValue: NumericParameterBlockHydrated;

    constructor(obj: AppendMaintenanceProgramBlockSpec)
    {
        super(obj);
        this.taskName = ParameterBlockRegistry.String(obj.append_maintenance[0]);
        this.taskValue = ParameterBlockRegistry.Numeric(obj.append_maintenance[1]);
    }

    public async execute(): Promise<void> {

        TurbineEventLoop.emit(`maintenance.append.${this.taskName.data}`, this.taskValue.data);

        super.execute();
    }

    static isAppendMaintenancePgB(obj: AllProgramBlocks): obj is AppendMaintenanceProgramBlockSpec
    {
        return (obj as AppendMaintenanceProgramBlockSpec).append_maintenance !== undefined;
    }
}