import { INumericParameterBlock, IStringParameterBlock } from "../../IParameterBlock";
import { IProgramBlock, IProgramBlocks } from "../../IProgramBlock";


export interface IWhileLoopProgramBlock extends IProgramBlock {
    name: "while";
    params: [INumericParameterBlock, IStringParameterBlock, INumericParameterBlock];
    blocks: IProgramBlocks[];
}
