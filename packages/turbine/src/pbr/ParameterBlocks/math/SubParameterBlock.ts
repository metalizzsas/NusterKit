import { NumericParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllParameterBlocks, SubParameterBlock as SubParameterBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/IParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlockRegistry";

export class SubParameterBlock extends NumericParameterBlockHydrated
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