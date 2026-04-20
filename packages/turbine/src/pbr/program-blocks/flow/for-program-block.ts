import type { NumericParameterBlockHydrated } from "$types/hydrated/cycle/blocks/parameter-block-hydrated";
import type { AllProgramBlocks, ForProgramBlock as ForProgramBlockSpec } from "$types/spec/cycle/program";
import type { PBRContext } from "../../../services/pbr-context";
import { ParameterBlockRegistry } from "../../parameter-blocks/parameter-block-registry";
import { ProgramBlock } from "../program-block";
import { ProgramBlockRegistry } from "../program-block-registry";

export class ForProgramBlock extends ProgramBlock {
	limit: NumericParameterBlockHydrated;
	blocks: Array<ProgramBlock>;

	current_iteration = 0;
	executed = false;

	constructor(obj: ForProgramBlockSpec, ctx: PBRContext) {
		super(obj, ctx);

		this.limit = ParameterBlockRegistry.Numeric(obj.for.limit);
		this.blocks = obj.for.blocks.map((k) => ProgramBlockRegistry(k, ctx));

		for (let i = 0; i < this.limit.data; i++) for (const block of this.blocks) this.estimatedRunTime += block.estimatedRunTime;
	}

	public async execute(signal?: AbortSignal) {
		const loop_count = this.limit.data;
		this.ctx.logger.log("info", `ForBlock: Will loop ${loop_count} times. Starting from: ${this.current_iteration}`);

		for (; this.current_iteration < loop_count; this.current_iteration++) {
			if (this.earlyExit === true || signal?.aborted === true) {
				this.executed = this.current_iteration + 1 == loop_count;
				this.ctx.logger.log("info", `ForBlock: Early exit at ${loop_count}.`);
				return;
			}

			for (const instuction of this.blocks) {
				await instuction.execute(signal);
			}
		}

		this.current_iteration = 0;
		this.executed = true;
	}

	dispose(): void {
		super.dispose();
		for (const b of this.blocks) b.dispose();
	}

	static is_for_pg_b(obj: AllProgramBlocks): obj is ForProgramBlockSpec {
		return (obj as ForProgramBlockSpec).for !== undefined;
	}
}
