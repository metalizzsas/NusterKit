import { INumericParameterBlock, IStringParameterBlock } from "../../IParameterBlock";
import { IProgramBlock } from "../../IProgramBlock";

export interface IVariableProgramBlock extends IProgramBlock {
    name: "variable";
    params: [IStringParameterBlock, INumericParameterBlock];
}
