import type { ProgramBlockHydrated } from "../../types/hydrated/cycle/blocks/ProgramBlockHydrated";
import type { AllProgramBlocks } from "../../types/spec/cycle/program";
import { TurbineEventLoop } from "../../events";

export class ProgramBlock implements ProgramBlockHydrated
{
    readonly name: string;

    estimatedRunTime = 0;
    executed = false;
    earlyExit = false;
    paused = false;
    
    constructor(obj: AllProgramBlocks)
    {
        this.name = Object.keys(obj)[0]; // Crappy way to get the function name

        TurbineEventLoop.on(`pbr.stop`, () => this.earlyExit = true);
        TurbineEventLoop.on(`pbr.status.update`, (state) => { if (state === "ended" || state === "ending") { this.earlyExit = true }});

        TurbineEventLoop.on('pbr.pause', () => this.paused = true);
        TurbineEventLoop.on('pbr.resume', () => this.paused = false);
    }
    
    /** Execute function */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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