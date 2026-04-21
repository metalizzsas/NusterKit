import type { NumericParameterBlockHydrated } from "$types/hydrated/cycle/blocks/parameter-block-hydrated";
import type { AllParameterBlocks, MultiplyParameterBlock as MultiplyParameterBlockSpec } from "$types/spec/cycle/parameter";
import type { PBRContext } from "../../../services/pbr-context";
import { NumericParameterBlock } from "../numeric-parameter-block";
import { ParameterBlockRegistry } from "../parameter-block-registry";

export class MultiplyParameterBlock extends NumericParameterBlock {
	numbers: NumericParameterBlockHydrated[];

	constructor(obj: MultiplyParameterBlockSpec, ctx?: PBRContext) {
		super(obj);
		this.numbers = obj.multiply.map((p) => ParameterBlockRegistry.Numeric(p, ctx));
	}

	public get data(): number {
		return this.numbers.reduce((acc, p) => acc * p.data, 1);
	}

	static is_multiply_pb(obj: AllParameterBlocks): obj is MultiplyParameterBlockSpec {
		return (obj as MultiplyParameterBlockSpec).multiply !== undefined;
	}
}
