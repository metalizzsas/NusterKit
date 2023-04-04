import type { ProgramBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ProgramBlockHydrated";
import type { AllProgramBlocks } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ProgramBlocks";

export class ProgramBlock implements ProgramBlockHydrated
{
    readonly name: string;

    estimatedRunTime = 0;
    executed = false;
    earlyExit = false;
    
    constructor(obj: AllProgramBlocks)
    {
        this.name = Object.keys(obj)[0]; // Crappy way to get the function name
    }
    
    /** Execute function */
    execute(signal?: AbortSignal): void | Promise<void>
    {
        this.executed = true;
    }

    toJSON()
    {
        // Hide the PBR Instance from serialization to avoid circular references
        return {...this, pbrInstance: undefined};
    }
}