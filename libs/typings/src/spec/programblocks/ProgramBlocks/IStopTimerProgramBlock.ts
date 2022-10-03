import { IStringParameterBlock } from "../../cycle/IParameterBlock";
import { IProgramBlock } from "../../cycle/IProgramBlock";


export interface IStopTimerProgramBlock extends IProgramBlock {
    name: "stopTimer";
    params: [IStringParameterBlock];
}
