import { IStringParameterBlock, INumericParameterBlock } from "../../IParameterBlock";
import { IProgramBlock } from "../../IProgramBlock";

export interface IPassiveProgramBlock extends IProgramBlock
{
    name: "passive";

    params: [
        IStringParameterBlock,
        INumericParameterBlock,
        INumericParameterBlock
    ];
}