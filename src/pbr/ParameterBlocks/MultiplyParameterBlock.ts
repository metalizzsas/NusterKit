import { NumericParameterBlocks, ParameterBlock } from ".";
import {  INumericParameterBlock } from "../../interfaces/IParameterBlock";
import { ProgramBlockRunner } from "../ProgramBlockRunner";
import { IMultiplyParameterBlock } from "../../interfaces/programblocks/ParameterBlocks/IMultiplyParameterBlock";

export class MultiplyParameterBlock extends ParameterBlock implements IMultiplyParameterBlock
{
    name = "multiply" as const;
    params: NumericParameterBlocks[]

    constructor(instance: ProgramBlockRunner, obj: IMultiplyParameterBlock)
    {
        super(instance);

        this.params = [];
        super.fillParameterBlocks(obj);
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

