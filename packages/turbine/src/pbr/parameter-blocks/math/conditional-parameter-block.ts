import type { AllParameterBlocks, ConditionalParameterBlock as ConditionalParameterBlockSpec } from "$types/spec/cycle/parameter";
import { NumericParameterBlock } from "../numeric-parameter-block";
import { ParameterBlockRegistry } from "../parameter-block-registry";

export class ConditionalParameterBlock extends NumericParameterBlock {
	comparator: ">" | ">=" | "<" | "<=" | "==" | "!=" | "===" | "!==";

	compare_left: NumericParameterBlock;
	compare_right: NumericParameterBlock;

	value_if_true: NumericParameterBlock;
	value_if_false: NumericParameterBlock;

	private operators: { [x: string]: (x: number, y: number) => boolean } = {
		">": (x: number, y: number) => x > y,
		"<": (x: number, y: number) => x < y,
		">=": (x: number, y: number) => x >= y,
		"<=": (x: number, y: number) => x <= y,
		"==": (x: number, y: number) => x == y,
		"===": (x: number, y: number) => x === y,
		"!=": (x: number, y: number) => x != y,
		"!==": (x: number, y: number) => x === y,
	};

	constructor(obj: ConditionalParameterBlockSpec) {
		super(obj);

		this.comparator = obj.conditional.comparison[1];
		this.compare_left = ParameterBlockRegistry.Numeric(obj.conditional.comparison[0]);
		this.compare_right = ParameterBlockRegistry.Numeric(obj.conditional.comparison[2]);

		this.value_if_true = ParameterBlockRegistry.Numeric(obj.conditional.value_if_true);
		this.value_if_false = ParameterBlockRegistry.Numeric(obj.conditional.value_if_false);
	}

	public get data(): number {
		return this.operators[this.comparator](this.compare_left.data, this.compare_right.data) ? this.value_if_true.data : this.value_if_false.data;
	}

	static is_conditional_pb(obj: AllParameterBlocks): obj is ConditionalParameterBlockSpec {
		return (obj as ConditionalParameterBlockSpec).conditional !== undefined;
	}
}
