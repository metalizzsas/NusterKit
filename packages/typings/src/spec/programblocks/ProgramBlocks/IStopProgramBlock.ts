import { IStringParameterBlock } from "../../cycle/IParameterBlock";
import { IProgramBlock } from "../../cycle/IProgramBlock";


export interface IStopProgramBlock extends IProgramBlock {
    name: "stop";
    params: [IStringParameterBlock];
}
