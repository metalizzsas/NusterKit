import { IStringParameterBlock, INumericParameterBlock } from "../../cycle/IParameterBlock";
import { IProgramBlock } from "../../cycle/IProgramBlock";

export interface IPassiveProgramBlock extends IProgramBlock
{
    name: "passive";

    params: [
        IStringParameterBlock,
        INumericParameterBlock,
        INumericParameterBlock
    ];
}