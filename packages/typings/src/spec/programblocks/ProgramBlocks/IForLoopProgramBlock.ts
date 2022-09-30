import { INumericParameterBlock } from "../../cycle/IParameterBlock";
import { IProgramBlock, IProgramBlocks } from "../../cycle/IProgramBlock";


export interface IForLoopProgramBlock extends IProgramBlock {
    name: "for";
    currentIteration?: number;
    params: [INumericParameterBlock];
    blocks: IProgramBlocks[];
}
