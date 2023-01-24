import type { NumericParameterBlocks } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ParameterBlocks";
import { ParameterBlock } from "./ParameterBlock";

export class NumericParameterBlock extends ParameterBlock<number>
{
    constructor(obj: NumericParameterBlocks)
    {
        super(obj);
    }
}