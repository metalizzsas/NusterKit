import { IConstantParameterBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ParameterBlocks/IConstantParameterBlock";
import { ParameterBlock } from ".";

export class ConstantParameterBlock extends ParameterBlock implements IConstantParameterBlock
{
    name = "const" as const;
    value: number;

    constructor(obj: IConstantParameterBlock)
    {
        super(obj);
        this.value = obj.value;
    }

    public data(): number
    {
        return this.value;
    }
}

