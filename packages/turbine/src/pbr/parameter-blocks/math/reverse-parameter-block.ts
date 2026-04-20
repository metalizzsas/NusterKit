import type { NumericParameterBlockHydrated } from "$types/hydrated/cycle/blocks/parameter-block-hydrated";
import type { AllParameterBlocks, ReverseParameterBlock as ReverseParameterBlockSpec } from "$types/spec/cycle/parameter";
import { NumericParameterBlock } from "../numeric-parameter-block";
import { ParameterBlockRegistry } from "../parameter-block-registry";

export class ReverseParameterBlock extends NumericParameterBlock {
	number: NumericParameterBlockHydrated;

	constructor(obj: ReverseParameterBlockSpec) {
		super(obj);
		this.number = ParameterBlockRegistry.Numeric(obj.reverse);
	}

	public get data(): number {
		return this.number.data == 1 ? 0 : 1;
	}

	static is_reverse_pb(obj: AllParameterBlocks): obj is ReverseParameterBlockSpec {
		return (obj as ReverseParameterBlockSpec).reverse !== undefined;
	}
}
