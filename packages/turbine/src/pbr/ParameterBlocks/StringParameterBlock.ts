import type { StringParameterBlocks } from "$types/spec/cycle/parameter";
import { ParameterBlock } from "./ParameterBlock";

export class StringParameterBlock extends ParameterBlock<string>
{
    constructor(obj: StringParameterBlocks)
    {
        super(obj);
    }
}