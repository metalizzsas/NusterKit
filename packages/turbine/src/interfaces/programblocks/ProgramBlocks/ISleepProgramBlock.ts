import { INumericParameterBlock } from "../../IParameterBlock";
import { IProgramBlock } from "../../IProgramBlock";


export interface ISleepProgramBlock extends IProgramBlock {
    name: "sleep";
    params: [INumericParameterBlock];
}
