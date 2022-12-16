import type { NumericParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import { ProgramBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ProgramBlockHydrated";
import type { AllProgramBlocks, SleepProgramBlock as SleepProgramBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/IProgramBlocks";
import { LoggerInstance } from "../../../app";
import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";
import { PBRMissingError } from "../../PBRMissingError";
import type { ProgramBlockRunner } from "../../ProgramBlockRunner";

export class SleepProgramBlock extends ProgramBlockHydrated
{    
    sleepTime: NumericParameterBlockHydrated;

    constructor(obj: SleepProgramBlockSpec, pbrInstance?: ProgramBlockRunner)
    {
        super(obj, pbrInstance);

        this.sleepTime = ParameterBlockRegistry.Numeric(obj.sleep);

        this.estimatedRunTime = this.sleepTime.data;
    }

    async execute(): Promise<void>
    {
        if(this.pbrInstance === undefined)
            throw new PBRMissingError("SleepBlock");
        
        const sleepTime = this.sleepTime.data * 1000;
        LoggerInstance.info(`SleepBlock: Will sleep for ${sleepTime} ms.`);

        for (let i = 0; i < ((sleepTime) / 10); i++)
        {
            if (["ending", "ended"].includes(this.pbrInstance.currentRunningStep.state) || ["ended", "ending"].includes(this.pbrInstance.status.mode))
                return;
            else
                await new Promise(resolve => { setTimeout(resolve, 10); });
        }
        this.executed = true;
    }

    toJSON()
    {
        return {...this, pbrInstance: undefined}
    }

    static isSleepPgB(obj: AllProgramBlocks): obj is SleepProgramBlockSpec
    {
        return (obj as SleepProgramBlockSpec).sleep !== undefined;
    }
}