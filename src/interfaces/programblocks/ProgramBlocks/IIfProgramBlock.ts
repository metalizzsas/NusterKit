import { INumericParameterBlock, IStringParameterBlock } from "../../IParameterBlock";
import { IProgramBlock, IProgramBlocks } from "../../IProgramBlock";


export interface IIfProgramBlock extends IProgramBlock {
    name: "if";

    params: [INumericParameterBlock, IStringParameterBlock, INumericParameterBlock];

    trueBlocks: IProgramBlocks[];
    falseBlocks: IProgramBlocks[];
}
