import { INumericParameterBlock, IStringParameterBlock } from "../../cycle/IParameterBlock";
import { IProgramBlock } from "../../cycle/IProgramBlock";

export interface IVariableProgramBlock extends IProgramBlock {
    name: "variable";
    params: [IStringParameterBlock, INumericParameterBlock];
}
