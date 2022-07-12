import { NumericParameterBlocks, ParameterBlock } from ".";
import { ProgramBlockRunner } from "../ProgramBlockRunner";
import { IReverseParameterBlock } from "../../interfaces/programblocks/ParameterBlocks/IReverseParameterBlock";
import { ParameterBlockRegistry } from "./ParameterBlockRegistry";

export class ReverseParameterBlock extends ParameterBlock implements IReverseParameterBlock
{
    name: "reverse" = "reverse";
    params: [NumericParameterBlocks];

    constructor(instance: ProgramBlockRunner, obj: IReverseParameterBlock)
    {
        super(instance);

        this.params = [ParameterBlockRegistry(instance, obj.params[0]) as NumericParameterBlocks];
    }
    
    public data(): number
    {
        return this.params[0].data() as number == 1 ? 0 : 1;
    }
}

