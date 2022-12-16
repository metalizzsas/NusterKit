import { NumericParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllParameterBlocks, ReverseParameterBlock as ReverseParameterBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/IParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlockRegistry";

export class ReverseParameterBlock extends NumericParameterBlockHydrated
{
    number: NumericParameterBlockHydrated;

    constructor(obj: ReverseParameterBlockSpec)
    {
        super(obj);
        this.number = ParameterBlockRegistry.Numeric(obj.reverse);
    }
    
    public get data(): number
    {
        return this.number.data == 1 ? 0 : 1;
    }

    static isReversePB(obj: AllParameterBlocks): obj is ReverseParameterBlockSpec
    {
        return (obj as ReverseParameterBlockSpec).reverse !== undefined;
    }
}

