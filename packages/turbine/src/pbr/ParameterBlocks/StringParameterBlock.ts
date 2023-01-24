import type { StringParameterBlocks } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ParameterBlocks";
import { ParameterBlock } from "./ParameterBlock";

export class StringParameterBlock extends ParameterBlock<string>
{
    constructor(obj: StringParameterBlocks)
    {
        super(obj);
    }
}