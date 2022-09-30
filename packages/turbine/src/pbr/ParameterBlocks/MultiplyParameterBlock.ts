import { NumericParameterBlocks, ParameterBlock } from ".";
import {  INumericParameterBlock } from "../../interfaces/IParameterBlock";
import { IMultiplyParameterBlock } from "../../interfaces/programblocks/ParameterBlocks/IMultiplyParameterBlock";
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

