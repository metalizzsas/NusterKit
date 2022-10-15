import type { INumericParameterBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/IParameterBlock";
import type { IMultiplyParameterBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ParameterBlocks/IMultiplyParameterBlock";
import type { NumericParameterBlocks} from ".";
import { ParameterBlock } from ".";
import { ParameterBlockRegistry } from "./ParameterBlockRegistry";

export class MultiplyParameterBlock extends ParameterBlock implements IMultiplyParameterBlock
{
    name = "multiply" as const;
    params: NumericParameterBlocks[]

    constructor(obj: IMultiplyParameterBlock)
    {
        super(obj);
        this.params = obj.params.map(p => ParameterBlockRegistry(p)) as NumericParameterBlocks[];
    }

    public data(): number
    {
        if(this.params as INumericParameterBlock[])
        {
            return this.params.reduce((acc, p) => acc * (p.data()), 1);
        }
        else
        {
            return 0;
        }
    }
}

