import type { AllParameterBlocks, ConditionalParameterBlock as ConditionalParameterBlockSpec } from "$types/spec/cycle/parameter";
import { ParameterBlockRegistry } from "../ParameterBlockRegistry";
import { NumericParameterBlock } from "../NumericParameterBlock";

export class ConditionalParameterBlock extends NumericParameterBlock
{  
    comparator: ">" | ">=" | "<" | "<=" | "==" | "!=" | "===" | "!==";

    compareLeft: NumericParameterBlock;
    compareRight: NumericParameterBlock;

    valueIfTrue: NumericParameterBlock;
    valueIfFalse: NumericParameterBlock;

    private operators: {[x: string]: (x: number, y: number) => boolean; } = {
        ">": (x: number, y: number) => x > y,
        "<": (x: number, y: number) => x < y,
        ">=": (x: number, y: number) => x >= y,
        "<=": (x: number, y: number) => x <= y,
        "==": (x: number, y: number) => x == y,
        "===": (x: number, y: number) => x === y,
        "!=": (x: number, y: number) => x != y,
        "!==": (x: number, y: number) => x === y
    };

    constructor(obj: ConditionalParameterBlockSpec)
    {
        super(obj);

        this.comparator = obj.conditional.comparison[1];
        this.compareLeft = ParameterBlockRegistry.Numeric(obj.conditional.comparison[0]);
        this.compareRight = ParameterBlockRegistry.Numeric(obj.conditional.comparison[2]);

        this.valueIfTrue = ParameterBlockRegistry.Numeric(obj.conditional.value_if_true);
        this.valueIfFalse = ParameterBlockRegistry.Numeric(obj.conditional.value_if_false);
    }

    public get data(): number
    {        
        return this.operators[this.comparator](this.compareLeft.data, this.compareRight.data) ? this.valueIfTrue.data : this.valueIfFalse.data;
    }

    static isConditionalPB(obj: AllParameterBlocks): obj is ConditionalParameterBlockSpec
    {
        return (obj as ConditionalParameterBlockSpec).conditional !== undefined;
    }
}

