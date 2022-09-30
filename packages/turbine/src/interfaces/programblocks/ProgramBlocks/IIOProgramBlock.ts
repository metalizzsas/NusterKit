import { INumericParameterBlock, IStringParameterBlock } from "../../IParameterBlock";
import { IProgramBlock } from "../../IProgramBlock";


export interface IIOProgramBlock extends IProgramBlock {
    name: "io";
    params: [IStringParameterBlock, INumericParameterBlock];
}
