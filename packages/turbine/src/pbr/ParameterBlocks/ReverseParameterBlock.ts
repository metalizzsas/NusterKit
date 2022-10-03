import { IReverseParameterBlock } from "@metalizzsas/nuster-typings/src/spec/cycle/programblocks/ParameterBlocks/IReverseParameterBlock";
import { NumericParameterBlocks, ParameterBlock } from ".";
import { ParameterBlockRegistry } from "./ParameterBlockRegistry";

export class ReverseParameterBlock extends ParameterBlock implements IReverseParameterBlock
{
    name = "reverse" as const;
    params: [NumericParameterBlocks];

    constructor(obj: IReverseParameterBlock)
    {
        super(obj);

        this.params = [ParameterBlockRegistry(obj.params[0]) as NumericParameterBlocks];
    }
    
    public data(): number
    {
        return this.params[0].data() as number == 1 ? 0 : 1;
    }
}

