import type { AllParameterBlocks, NumberParameterBlock as NumberParameterBlockSpec } from "$types/spec/cycle/parameter";
import { NumericParameterBlock } from "../numeric-parameter-block";

export class NumberParameterBlock extends NumericParameterBlock {
	#value: number;

	constructor(obj: NumberParameterBlockSpec) {
		super(obj);
		this.#value = obj.number;
	}

	public get data(): number {
		return this.#value;
	}

	static is_number_pb(obj: AllParameterBlocks): obj is NumberParameterBlockSpec {
		return (obj as NumberParameterBlockSpec).number !== undefined;
	}
}
