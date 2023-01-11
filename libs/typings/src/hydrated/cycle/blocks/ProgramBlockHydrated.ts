import type { AllProgramBlocks } from "../../../spec/cycle/blocks/ProgramBlocks";

export class ProgramBlockHydrated {
    
    readonly name: string;

    estimatedRunTime = 0;
    executed = false;
    earlyExit = false;
    
    constructor(obj: AllProgramBlocks)
    {
        this.name = Object.keys(obj)[0]; // Crappy way to get the function name
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