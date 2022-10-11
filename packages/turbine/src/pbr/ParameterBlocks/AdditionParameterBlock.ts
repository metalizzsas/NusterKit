import { IAdditionParameterBlock } from "@metalizzsas/nuster-typings/src/spec/cycle/programblocks/ParameterBlocks/IAdditionParameterBlock";
import { NumericParameterBlocks, ParameterBlock } from ".";
import { ParameterBlockRegistry } from "./ParameterBlockRegistry";

export class AdditionParameterBlock extends ParameterBlock implements IAdditionParameterBlock
{
    name = "add" as const;
    params: NumericParameterBlocks[];

    constructor(obj: IAdditionParameterBlock)
    {
        super(obj);
        this.params = obj.params.map(p => ParameterBlockRegistry(p)) as NumericParameterBlocks[];
    }

    public data(): number
    {
        return this.params.reduce((acc, p) => acc + (p.data()), 0);
    }
}

