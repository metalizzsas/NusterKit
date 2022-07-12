import { NumericParameterBlocks, ParameterBlock } from ".";
import { ProgramBlockRunner } from "../ProgramBlockRunner";
import { IAdditionParameterBlock } from "../../interfaces/programblocks/ParameterBlocks/IAdditionParameterBlock";

export class AdditionParameterBlock extends ParameterBlock implements IAdditionParameterBlock
{
    name: "add" = "add";
    params: NumericParameterBlocks[];

    constructor(instance: ProgramBlockRunner, obj: IAdditionParameterBlock)
    {
        super(instance);

        this.params = [];
        super.fillParameterBlocks(obj);
    }

    public data(): number
    {
        return this.params.reduce((acc, p) => acc + (p.data()), 0);
    }
}

