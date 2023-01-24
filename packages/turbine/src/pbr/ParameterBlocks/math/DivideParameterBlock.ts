import type { NumericParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllParameterBlocks, DivideParameterBlock as DivideParameterBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlockRegistry";
import { NumericParameterBlock } from "../NumericParameterBlock";

export class DivideParameterBlock extends NumericParameterBlock
{
    private numbers: [NumericParameterBlockHydrated, NumericParameterBlockHydrated];
    constructor(obj: DivideParameterBlockSpec)
    {
        super(obj);
        this.numbers = [ParameterBlockRegistry.Numeric(obj.divide[0]), ParameterBlockRegistry.Numeric(obj.divide[1])];
    }

    public get data(): number
    {
        return this.numbers[0].data / this.numbers[1].data;
    }

    static isDividePB(obj: AllParameterBlocks): obj is DivideParameterBlockSpec
    {
        return (obj as DivideParameterBlockSpec).divide !== undefined;
    }
}