import { IStringParameterBlock } from "../../IParameterBlock";
import { IProgramBlock } from "../../IProgramBlock";


export interface IStopProgramBlock extends IProgramBlock {
    name: "stop";
    params: [IStringParameterBlock];
}
