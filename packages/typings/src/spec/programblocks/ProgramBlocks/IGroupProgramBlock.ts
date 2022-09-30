import { IProgramBlock, IProgramBlocks } from "../../cycle/IProgramBlock";


export interface IGroupProgramBlock extends IProgramBlock {
    name: "group";
    blocks: IProgramBlocks[];
}
