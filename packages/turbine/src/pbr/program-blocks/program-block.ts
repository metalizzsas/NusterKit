import type { PBRContext } from "../../services/pbr-context";
import type { ProgramBlockHydrated } from "../../types/hydrated/cycle/blocks/program-block-hydrated";
import type { AllProgramBlocks } from "../../types/spec/cycle/program";

export class ProgramBlock implements ProgramBlockHydrated {
	readonly name: string;

	estimatedRunTime = 0;
	executed = false;
	earlyExit = false;
	paused = false;

	protected ctx: PBRContext;

	private _on_stop: () => void;
	private _on_status_update: (state: string) => void;
	private _on_pause: () => void;
	private _on_resume: () => void;

	constructor(obj: AllProgramBlocks, ctx: PBRContext) {
		this.name = Object.keys(obj)[0];
		this.ctx = ctx;

		this._on_stop = () => {
			this.earlyExit = true;
		};
		this._on_status_update = (state) => {
			if (state === "ended" || state === "ending") {
				this.earlyExit = true;
			}
		};
		this._on_pause = () => {
			this.paused = true;
		};
		this._on_resume = () => {
			this.paused = false;
		};

		this.ctx.pbr_emitter.on("stop", this._on_stop);
		this.ctx.pbr_emitter.on("status.update", this._on_status_update);
		this.ctx.pbr_emitter.on("pause", this._on_pause);
		this.ctx.pbr_emitter.on("resume", this._on_resume);
	}

	/** Execute function */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	execute(signal?: AbortSignal): void | Promise<void> {
		this.executed = true;
	}

	/** Remove event listeners registered by this block */
	dispose(): void {
		this.ctx.pbr_emitter.off("stop", this._on_stop);
		this.ctx.pbr_emitter.off("status.update", this._on_status_update);
		this.ctx.pbr_emitter.off("pause", this._on_pause);
		this.ctx.pbr_emitter.off("resume", this._on_resume);
	}

	toJSON() {
		return { ...this, pbr_instance: undefined };
	}
}
