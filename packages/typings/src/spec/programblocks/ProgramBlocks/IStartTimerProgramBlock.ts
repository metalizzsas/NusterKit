import { INumericParameterBlock, IStringParameterBlock } from "../../cycle/IParameterBlock";
import { IProgramBlock, IProgramBlocks } from "../../cycle/IProgramBlock";


export interface IStartTimerProgramBlock extends IProgramBlock {
    name: "startTimer";
    params: [IStringParameterBlock, INumericParameterBlock];
    blocks: IProgramBlocks[];
}
