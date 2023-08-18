import type { NumericParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllProgramBlocks, SleepProgramBlock as SleepProgramBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ProgramBlocks";
import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";
import { TurbineEventLoop } from "../../../events";
import { ProgramBlock } from "../ProgramBlock";

export class SleepProgramBlock extends ProgramBlock
{    
    sleepTime: NumericParameterBlockHydrated;

    iterationsSkippedByPause = 0;
    currentSleepTime = 0;

    sleepStarted = false;

    constructor(obj: SleepProgramBlockSpec)
    {
        super(obj);

        this.sleepTime = ParameterBlockRegistry.Numeric(obj.sleep);
        this.estimatedRunTime = this.sleepTime.data;

        TurbineEventLoop.on(`pbr.status.update`, (state) => { if (state === "ended" || state === "ending") { this.earlyExit = true }});

        TurbineEventLoop.on('pbr.resume', () => {
            if(this.sleepStarted && !this.executed)
            {
                TurbineEventLoop.emit("log", "info", `SleepBlock: Resuming, paused during ${this.iterationsSkippedByPause * 10} ms. Slept ${this.currentSleepTime * 10} / ${this.sleepTime.data * 1000 + this.iterationsSkippedByPause * 10} ms.`);
            }
        });
    }

    async execute(signal?: AbortSignal): Promise<void>
    {
        this.sleepStarted = true;
        this.iterationsSkippedByPause = 0;

        const timeStart = performance.now();
        const sleepTime = this.sleepTime.data * 1000;
        
        TurbineEventLoop.emit("log", "info", `SleepBlock: Will sleep for ${sleepTime} ms.`);
        TurbineEventLoop.emit("pbr.setPausable", true);

        for (this.currentSleepTime = 0; this.currentSleepTime < ((sleepTime) / 10) + this.iterationsSkippedByPause; this.currentSleepTime++)
        {
            const timeLoop = performance.now();

            if(this.paused)
                this.iterationsSkippedByPause++;

            if (this.earlyExit === true || signal?.aborted === true)
                break;
            
            if((timeLoop - timeStart) >= (sleepTime + (this.iterationsSkippedByPause * 10)))
                break;

            await new Promise(resolve => { setTimeout(resolve, 10); });
        }

        TurbineEventLoop.emit("pbr.setPausable", false);
        this.executed = true;
    }

    static isSleepPgB(obj: AllProgramBlocks): obj is SleepProgramBlockSpec
    {
        return (obj as SleepProgramBlockSpec).sleep !== undefined;
    }
}