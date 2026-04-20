import type { NumericParameterBlockHydrated, StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/parameter-block-hydrated";
import type { Comparators } from "$types/spec/cycle/parameter";
import type { AllProgramBlocks, IfProgramBlock as IfProgramBlockSpec } from "$types/spec/cycle/program";
import type { PBRContext } from "../../../services/pbr-context";
import { ParameterBlockRegistry } from "../../parameter-blocks/parameter-block-registry";
import ComparativeFunctions from "../../utils/comparative-functions";
import { ProgramBlock } from "../program-block";
import { ProgramBlockRegistry } from "../program-block-registry";

export class IfProgramBlock extends ProgramBlock {
	comparator: StringParameterBlockHydrated;

	left_side: NumericParameterBlockHydrated;
	right_side: NumericParameterBlockHydrated;

	true_blocks: Array<ProgramBlock>;
	false_blocks: Array<ProgramBlock>;

	constructor(obj: IfProgramBlockSpec, ctx: PBRContext) {
		super(obj, ctx);
		this.comparator = ParameterBlockRegistry.String(obj.if.comparison[1]);

		this.left_side = ParameterBlockRegistry.Numeric(obj.if.comparison[0]);
		this.right_side = ParameterBlockRegistry.Numeric(obj.if.comparison[2]);

		this.true_blocks = obj.if.true_blocks.map((k) => ProgramBlockRegistry(k, ctx));
		this.false_blocks = obj.if.false_blocks?.map((k) => ProgramBlockRegistry(k, ctx)) ?? [];

		if (ComparativeFunctions[this.comparator.data as Comparators](this.left_side.data, this.right_side.data))
			this.estimatedRunTime = this.true_blocks.reduce((p, c) => p + c.estimatedRunTime, 0);
		else this.estimatedRunTime = this.false_blocks.reduce((p, c) => p + c.estimatedRunTime, 0);
	}

	public async execute(signal?: AbortSignal) {
		const left = this.left_side.data;
		const right = this.right_side.data;
		const comparator = this.comparator.data as Comparators;

		this.ctx.logger.log("info", `IfBlock: Will compare ${left} and ${right} by ${comparator}`);

		if (ComparativeFunctions[comparator](left, right)) {
			for (const t_b of this.true_blocks) {
				await t_b.execute(signal);
			}
		} else {
			for (const f_b of this.false_blocks) {
				await f_b.execute(signal);
			}
		}

		super.execute();
	}

	dispose(): void {
		super.dispose();
		for (const b of this.true_blocks) b.dispose();
		for (const b of this.false_blocks) b.dispose();
	}

	static is_if_pg_b(obj: AllProgramBlocks): obj is IfProgramBlockSpec {
		return (obj as IfProgramBlockSpec).if !== undefined;
	}
}
