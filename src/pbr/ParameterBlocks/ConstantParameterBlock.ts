import { ParameterBlock } from ".";
import { ProgramBlockRunner } from "../ProgramBlockRunner";
import { IConstantParameterBlock } from "../../interfaces/programblocks/ParameterBlocks/IConstantParameterBlock";

export class ConstantParameterBlock extends ParameterBlock implements IConstantParameterBlock
{
    name = "const" as const;
    value: number;

    constructor(instance: ProgramBlockRunner, obj: IConstantParameterBlock)
    {
        super(instance);
        this.value = obj.value;
    }

    public data(): number
    {
        return this.value;
    }
}

