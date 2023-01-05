import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";
import { ProgramBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ProgramBlockHydrated";
import type { AllProgramBlocks, StopProgramBlock as StopProgramBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ProgramBlocks";
import type { StringParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import { TurbineEventLoop } from "../../../events";

export class StopProgramBlock extends ProgramBlockHydrated
{
    stopReason: StringParameterBlockHydrated;

    constructor(obj: StopProgramBlockSpec)
    {
        super(obj);
        this.stopReason = ParameterBlockRegistry.String(obj.stop)
    }

    public async execute(): Promise<void>
    {
        if (process.env.NODE_ENV != "production") {
            TurbineEventLoop.emit("log", "warning", "StopBlock: Debug mode will not stop the machine.")
            return;
        }

        TurbineEventLoop.emit(`pbr.stop`, this.stopReason.data);

        super.execute();
    }

    static isStopPgB(obj: AllProgramBlocks): obj is StopProgramBlockSpec
    {
        return (obj as StopProgramBlockSpec).stop !== undefined;
    }
}

