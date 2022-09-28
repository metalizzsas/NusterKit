import { ParameterBlock } from ".";
import { IConstantStringParameterBlock } from "../../interfaces/programblocks/ParameterBlocks/IConstantStringParameterBlock";

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

