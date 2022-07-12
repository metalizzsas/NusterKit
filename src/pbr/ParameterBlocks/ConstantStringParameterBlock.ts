import { ParameterBlock } from ".";
import { ProgramBlockRunner } from "../ProgramBlockRunner";
import { IConstantStringParameterBlock } from "../../interfaces/programblocks/ParameterBlocks/IConstantStringParameterBlock";

export class ConstantStringParameterBlock extends ParameterBlock implements IConstantStringParameterBlock
{
    name: "conststr" = "conststr";
    value: string;

    constructor(instance: ProgramBlockRunner, obj: IConstantStringParameterBlock)
    {
        super(instance);
        this.value = obj.value;
    }

    public data(): string
    {
        return this.value;
    }
}

