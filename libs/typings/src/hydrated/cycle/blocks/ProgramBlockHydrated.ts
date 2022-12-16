import { AllProgramBlocks } from "../../../spec/cycle/IProgramBlocks";
import type { IProgramBlockRunnerHydrated } from "../IProgramBlockRunnerHydrated";

export class ProgramBlockHydrated {

    protected pbrInstance?: IProgramBlockRunnerHydrated;
    
    readonly name: string;

    estimatedRunTime = 0;
    executed = false;
    
    constructor(obj: AllProgramBlocks, pbrInstance?: IProgramBlockRunnerHydrated)
    {
        this.name = Object.keys(obj)[0]; // Crappy way to get the function name
        this.pbrInstance = pbrInstance;
    }
    
    /** Execute function */
    execute(): void | Promise<void>
    {
        this.executed = true;
    }

    toJSON()
    {
        // Hide the PBR Instance from serialization to avoid circular references
        return {...this, pbrInstance: undefined};
    }
}