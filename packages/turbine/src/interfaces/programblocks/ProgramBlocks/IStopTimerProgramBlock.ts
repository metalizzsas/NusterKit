import { IStringParameterBlock } from "../../IParameterBlock";
import { IProgramBlock } from "../../IProgramBlock";


export interface IStopTimerProgramBlock extends IProgramBlock {
    name: "stopTimer";
    params: [IStringParameterBlock];
}
