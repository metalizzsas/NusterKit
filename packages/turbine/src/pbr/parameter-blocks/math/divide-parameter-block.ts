import type { NumericParameterBlockHydrated } from "$types/hydrated/cycle/blocks/parameter-block-hydrated";
import type { AllParameterBlocks, DivideParameterBlock as DivideParameterBlockSpec } from "$types/spec/cycle/parameter";
import { NumericParameterBlock } from "../numeric-parameter-block";
import { ParameterBlockRegistry } from "../parameter-block-registry";

export class DivideParameterBlock extends NumericParameterBlock {
	private numbers: [NumericParameterBlockHydrated, NumericParameterBlockHydrated];
	constructor(obj: DivideParameterBlockSpec) {
		super(obj);
		this.numbers = [ParameterBlockRegistry.Numeric(obj.divide[0]), ParameterBlockRegistry.Numeric(obj.divide[1])];
	}

	public get data(): number {
		return this.numbers[0].data / this.numbers[1].data;
	}

	static is_divide_pb(obj: AllParameterBlocks): obj is DivideParameterBlockSpec {
		return (obj as DivideParameterBlockSpec).divide !== undefined;
	}
}
