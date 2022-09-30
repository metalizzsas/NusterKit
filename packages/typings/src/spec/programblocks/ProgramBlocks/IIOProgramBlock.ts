import { INumericParameterBlock, IStringParameterBlock } from "../../cycle/IParameterBlock";
import { IProgramBlock } from "../../cycle/IProgramBlock";


export interface IIOProgramBlock extends IProgramBlock {
    name: "io";
    params: [IStringParameterBlock, INumericParameterBlock];
}
