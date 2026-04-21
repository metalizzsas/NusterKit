import type { NumericParameterBlockHydrated } from "$types/hydrated/cycle/blocks/parameter-block-hydrated";
import type { AllParameterBlocks, SubParameterBlock as SubParameterBlockSpec } from "$types/spec/cycle/parameter";
import type { PBRContext } from "../../../services/pbr-context";
import { NumericParameterBlock } from "../numeric-parameter-block";
import { ParameterBlockRegistry } from "../parameter-block-registry";

export class SubParameterBlock extends NumericParameterBlock {
	private numbers: Array<NumericParameterBlockHydrated>;

	constructor(object: SubParameterBlockSpec, ctx?: PBRContext) {
		super(object);
		this.numbers = object.sub.map((n) => ParameterBlockRegistry.Numeric(n, ctx));
	}

	public get data(): number {
		return this.numbers.reduce((p, c) => p - c.data, 0);
	}

	static is_sub_pb(obj: AllParameterBlocks): obj is SubParameterBlockSpec {
		return (obj as SubParameterBlockSpec).sub !== undefined;
	}
}
