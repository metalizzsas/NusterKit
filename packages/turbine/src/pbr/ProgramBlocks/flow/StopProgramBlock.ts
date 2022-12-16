import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";
import { LoggerInstance } from "../../../app";
import { PBRMissingError } from "../../PBRMissingError";
import { ProgramBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ProgramBlockHydrated";
import type { AllProgramBlocks, StopProgramBlock as StopProgramBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/IProgramBlocks";
import type { StringParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { ProgramBlockRunner } from "../../ProgramBlockRunner";

export class StopProgramBlock extends ProgramBlockHydrated
{
    stopReason: StringParameterBlockHydrated;

    constructor(obj: StopProgramBlockSpec, pbrInstance?: ProgramBlockRunner)
    {
        super(obj, pbrInstance);
        this.pbrInstance = pbrInstance;
        this.stopReason = ParameterBlockRegistry.String(obj.stop)
    }

    public async execute(): Promise<void>
    {

        if(this.pbrInstance === undefined)
            throw new PBRMissingError("StopPRogram");
        
        if (process.env.NODE_ENV != "production") {
            LoggerInstance.info("StopBlock: Debug mode will not stop the machine.");
            return;
        }

        this.pbrInstance.end(this.stopReason.data);
        super.execute();
    }

    static isStopPgB(obj: AllProgramBlocks): obj is StopProgramBlockSpec
    {
        return (obj as StopProgramBlockSpec).stop !== undefined;
    }
}

