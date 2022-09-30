import { INumericParameterBlock } from "../../cycle/IParameterBlock";
import { IProgramBlock } from "../../cycle/IProgramBlock";


export interface ISleepProgramBlock extends IProgramBlock {
    name: "sleep";
    params: [INumericParameterBlock];
}
