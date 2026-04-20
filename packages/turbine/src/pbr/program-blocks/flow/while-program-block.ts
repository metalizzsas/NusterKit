import type { NumericParameterBlockHydrated, StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/parameter-block-hydrated";
import type { Comparators } from "$types/spec/cycle/parameter";
import type { AllProgramBlocks, WhileProgramBlock as WhileProgramBlockSpec } from "$types/spec/cycle/program";
import type { PBRContext } from "../../../services/pbr-context";
import { ParameterBlockRegistry } from "../../parameter-blocks/parameter-block-registry";
import ComparativeFunctions from "../../utils/comparative-functions";
import { ProgramBlock } from "../program-block";
import { ProgramBlockRegistry } from "../program-block-registry";

export class WhileProgramBlock extends ProgramBlock {
	comparator: StringParameterBlockHydrated;
	left_side: NumericParameterBlockHydrated;
	right_side: NumericParameterBlockHydrated;

	blocks: Array<ProgramBlock>;

	constructor(obj: WhileProgramBlockSpec, ctx: PBRContext) {
		super(obj, ctx);
		this.comparator = ParameterBlockRegistry.String(obj.while.comparison[1]);

		this.left_side = ParameterBlockRegistry.Numeric(obj.while.comparison[0]);
		this.right_side = ParameterBlockRegistry.Numeric(obj.while.comparison[2]);

		this.blocks = obj.while.blocks.map((k) => ProgramBlockRegistry(k, ctx));

		// While loop has an infinity runTime because it cannot be determined
		this.estimatedRunTime = Infinity;
	}

	public async execute(signal?: AbortSignal): Promise<void> {
		while (ComparativeFunctions[this.comparator.data as Comparators](this.left_side.data, this.right_side.data)) {
			if (this.earlyExit === true || signal?.aborted === true) {
				this.executed = true;
				return;
			}
			for (const b of this.blocks) {
				await b.execute(signal);
			}
		}

		super.execute();
	}

	static is_while_pg_b(obj: AllProgramBlocks): obj is WhileProgramBlockSpec {
		return (obj as WhileProgramBlockSpec).while !== undefined;
	}
}
