import type { NumericParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllProgramBlocks, SleepProgramBlock as SleepProgramBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ProgramBlocks";
import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";
import { TurbineEventLoop } from "../../../events";
import { ProgramBlock } from "../ProgramBlock";

export class SleepProgramBlock extends ProgramBlock
{    
    sleepTime: NumericParameterBlockHydrated;

    constructor(obj: SleepProgramBlockSpec)
    {
        super(obj);

        this.sleepTime = ParameterBlockRegistry.Numeric(obj.sleep);
        this.estimatedRunTime = this.sleepTime.data;

        TurbineEventLoop.on(`pbr.stop`, () => this.earlyExit = true);
        TurbineEventLoop.on(`pbr.status.update`, (state) => { if (state === "ended" || state === "ending") { this.earlyExit = true }});
    }

    async execute(signal?: AbortSignal): Promise<void>
    {        
        const timeStart = performance.now();
        const sleepTime = this.sleepTime.data * 1000;
        
        TurbineEventLoop.emit("log", "info", `SleepBlock: Will sleep for ${sleepTime} ms.`);

        for (let i = 0; i < ((sleepTime) / 10); i++)
        {
            const timeLoop = performance.now();

            if (this.earlyExit === true || signal?.aborted === true)
                break;
            if(timeLoop - timeStart >= sleepTime)
                break;
            else
                await new Promise(resolve => { setTimeout(resolve, 10); });
        }

        this.executed = true;
    }

    static isSleepPgB(obj: AllProgramBlocks): obj is SleepProgramBlockSpec
    {
        return (obj as SleepProgramBlockSpec).sleep !== undefined;
    }
}