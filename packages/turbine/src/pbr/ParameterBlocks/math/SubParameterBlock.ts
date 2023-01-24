import type { AllParameterBlocks, SubParameterBlock as SubParameterBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlockRegistry";
import { NumericParameterBlock } from "../NumericParameterBlock";
import type { NumericParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";

export class SubParameterBlock extends NumericParameterBlock
{
    private numbers: Array<NumericParameterBlockHydrated>;

    constructor(object: SubParameterBlockSpec)
    {
        super(object);
        this.numbers = object.sub.map(n => ParameterBlockRegistry.Numeric(n));
    }

    public get data(): number
    {
        return this.numbers.reduce((p, c) => p - c.data, 0);
    }

    static isSubPB(obj: AllParameterBlocks): obj is SubParameterBlockSpec
    {
        return (obj as SubParameterBlockSpec).sub !== undefined;
    }
}