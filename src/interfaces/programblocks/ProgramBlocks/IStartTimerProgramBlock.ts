import { INumericParameterBlock, IStringParameterBlock } from "../../IParameterBlock";
import { IProgramBlock, IProgramBlocks } from "../../IProgramBlock";


export interface IStartTimerProgramBlock extends IProgramBlock {
    name: "startTimer";
    params: [IStringParameterBlock, INumericParameterBlock];
    blocks: IProgramBlocks[];
}
