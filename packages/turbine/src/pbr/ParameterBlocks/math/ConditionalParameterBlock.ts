import { NumericParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllParameterBlocks, ConditionalParameterBlock as ConditionalParameterBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlockRegistry";

export class ConditionalParameterBlock extends NumericParameterBlockHydrated
{  
    comparator: ">" | ">=" | "<" | "<=" | "==" | "!=" | "===" | "!==";
    leftSide: [NumericParameterBlockHydrated, NumericParameterBlockHydrated];
    rightSide: [NumericParameterBlockHydrated, NumericParameterBlockHydrated];

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
        this.comparator = obj.conditional.comparator;

        this.leftSide = [ParameterBlockRegistry.Numeric(obj.conditional.left_side[0]), ParameterBlockRegistry.Numeric(obj.conditional.left_side[1])]
        this.rightSide = [ParameterBlockRegistry.Numeric(obj.conditional.right_side[0]), ParameterBlockRegistry.Numeric(obj.conditional.right_side[1])]
    }

    public get data(): number
    {        
        return this.operators[this.comparator](this.leftSide[0].data, this.rightSide[0].data) ? this.leftSide[1].data : this.rightSide[1].data
    }

    static isConditionalPB(obj: AllParameterBlocks): obj is ConditionalParameterBlockSpec
    {
        return (obj as ConditionalParameterBlockSpec).conditional !== undefined;
    }
}
