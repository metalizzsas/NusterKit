import type { ProgramBlockHydrated } from "../../types/hydrated/cycle/blocks/ProgramBlockHydrated";
import type { AllProgramBlocks } from "../../types/spec/cycle/program";
import type { PBRContext } from "../../services/PBRContext";

export class ProgramBlock implements ProgramBlockHydrated {
	readonly name: string;

	estimatedRunTime = 0;
	executed = false;
	earlyExit = false;
	paused = false;

	protected ctx: PBRContext;

	private _onStop: () => void;
	private _onStatusUpdate: (state: string) => void;
	private _onPause: () => void;
	private _onResume: () => void;

	constructor(obj: AllProgramBlocks, ctx: PBRContext) {
		this.name = Object.keys(obj)[0];
		this.ctx = ctx;

		this._onStop = () => { this.earlyExit = true; };
		this._onStatusUpdate = (state) => { if (state === "ended" || state === "ending") { this.earlyExit = true; } };
		this._onPause = () => { this.paused = true; };
		this._onResume = () => { this.paused = false; };

		this.ctx.pbrEmitter.on("stop", this._onStop);
		this.ctx.pbrEmitter.on("status.update", this._onStatusUpdate);
		this.ctx.pbrEmitter.on("pause", this._onPause);
		this.ctx.pbrEmitter.on("resume", this._onResume);
	}

	/** Execute function */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	execute(signal?: AbortSignal): void | Promise<void> {
		this.executed = true;
	}

	/** Remove event listeners registered by this block */
	dispose(): void {
		this.ctx.pbrEmitter.off("stop", this._onStop);
		this.ctx.pbrEmitter.off("status.update", this._onStatusUpdate);
		this.ctx.pbrEmitter.off("pause", this._onPause);
		this.ctx.pbrEmitter.off("resume", this._onResume);
	}

	toJSON() {
		return { ...this, pbrInstance: undefined };
	}
}
