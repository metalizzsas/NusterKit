import { INumericParameterBlock, IStringParameterBlock } from "../../cycle/IParameterBlock";
import { IProgramBlock, IProgramBlocks } from "../../cycle/IProgramBlock";


export interface IIfProgramBlock extends IProgramBlock {
    name: "if";

    params: [INumericParameterBlock, IStringParameterBlock, INumericParameterBlock];

    trueBlocks: IProgramBlocks[];
    falseBlocks: IProgramBlocks[];
}
