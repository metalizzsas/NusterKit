import { INumericParameterBlock } from "../../IParameterBlock";
import { IProgramBlock, IProgramBlocks } from "../../IProgramBlock";


export interface IForLoopProgramBlock extends IProgramBlock {
    name: "for";
    currentIteration?: number;
    params: [INumericParameterBlock];
    blocks: IProgramBlocks[];
}
