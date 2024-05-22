import type { NumericParameterBlocks } from "$types/spec/cycle/parameter";
import { ParameterBlock } from "./ParameterBlock";

export class NumericParameterBlock extends ParameterBlock<number>
{
    constructor(obj: NumericParameterBlocks)
    {
        super(obj);
    }
}