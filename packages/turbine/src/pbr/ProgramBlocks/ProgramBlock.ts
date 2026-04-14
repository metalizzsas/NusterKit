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

    private _onStop: () => void;
    private _onStatusUpdate: (state: string) => void;
    private _onPause: () => void;
    private _onResume: () => void;

    constructor(obj: AllProgramBlocks)
    {
        this.name = Object.keys(obj)[0]; // Crappy way to get the function name

        this._onStop = () => { this.earlyExit = true; };
        this._onStatusUpdate = (state) => { if (state === "ended" || state === "ending") { this.earlyExit = true; } };
        this._onPause = () => { this.paused = true; };
        this._onResume = () => { this.paused = false; };

        TurbineEventLoop.on('pbr.stop', this._onStop);
        TurbineEventLoop.on('pbr.status.update', this._onStatusUpdate);
        TurbineEventLoop.on('pbr.pause', this._onPause);
        TurbineEventLoop.on('pbr.resume', this._onResume);
    }

    /** Execute function */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    execute(signal?: AbortSignal): void | Promise<void>
    {
        this.executed = true;
    }

    /** Remove event listeners registered by this block */
    dispose(): void
    {
        TurbineEventLoop.removeListener('pbr.stop', this._onStop);
        TurbineEventLoop.removeListener('pbr.status.update', this._onStatusUpdate);
        TurbineEventLoop.removeListener('pbr.pause', this._onPause);
        TurbineEventLoop.removeListener('pbr.resume', this._onResume);
    }

    toJSON()
    {
        // Hide the PBR Instance from serialization to avoid circular references
        return {...this, pbrInstance: undefined};
    }
}