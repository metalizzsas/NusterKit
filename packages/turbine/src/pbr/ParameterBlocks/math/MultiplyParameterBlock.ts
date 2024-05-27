import type { AllParameterBlocks, MultiplyParameterBlock as MultiplyParameterBlockSpec } from "$types/spec/cycle/parameter";
import type { NumericParameterBlockHydrated } from "$types/hydrated/cycle/blocks/ParameterBlockHydrated";

import { ParameterBlockRegistry } from "../ParameterBlockRegistry";
import { NumericParameterBlock } from "../NumericParameterBlock";

export class MultiplyParameterBlock extends NumericParameterBlock
{
    numbers: NumericParameterBlockHydrated[]

    constructor(obj: MultiplyParameterBlockSpec)
    {
        super(obj);
        this.numbers = obj.multiply.map(p => ParameterBlockRegistry.Numeric(p))
    }

    public get data(): number
    {
        return this.numbers.reduce((acc, p) => acc * (p.data), 1);
    }

    static isMultiplyPB(obj: AllParameterBlocks): obj is MultiplyParameterBlockSpec
    {
        return (obj as MultiplyParameterBlockSpec).multiply !== undefined;
    }
}

