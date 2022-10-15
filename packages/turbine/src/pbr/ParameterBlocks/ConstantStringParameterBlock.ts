import type { IConstantStringParameterBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ParameterBlocks/IConstantStringParameterBlock";
import { ParameterBlock } from ".";

export class ConstantStringParameterBlock extends ParameterBlock implements IConstantStringParameterBlock
{
    name = "conststr" as const;
    value: string;

    constructor(obj: IConstantStringParameterBlock)
    {
        super(obj);
        this.value = obj.value;
    }

    public data(): string
    {
        return this.value;
    }
}

