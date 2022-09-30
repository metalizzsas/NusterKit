import { ParameterBlock } from ".";
import { IConstantParameterBlock } from "../../interfaces/programblocks/ParameterBlocks/IConstantParameterBlock";

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

