import { INumericParameterBlock, IStringParameterBlock } from "../../cycle/IParameterBlock";
import { IProgramBlock, IProgramBlocks } from "../../cycle/IProgramBlock";


export interface IWhileLoopProgramBlock extends IProgramBlock {
    name: "while";
    params: [INumericParameterBlock, IStringParameterBlock, INumericParameterBlock];
    blocks: IProgramBlocks[];
}
