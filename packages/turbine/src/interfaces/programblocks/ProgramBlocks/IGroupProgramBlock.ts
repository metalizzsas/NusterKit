import { IProgramBlock, IProgramBlocks } from "../../IProgramBlock";


export interface IGroupProgramBlock extends IProgramBlock {
    name: "group";
    blocks: IProgramBlocks[];
}
