import { IGroupProgramBlock } from "../../interfaces/programblocks/ProgramBlocks/IGroupProgramBlock";
import { ProgramBlock, ProgramBlocks } from "./index";
import { LoggerInstance } from "../../app";
import { ProgramBlockRegistry } from "./ProgramBlockRegistry";

/** @deprecated */
export class GroupProgramBlock extends ProgramBlock implements IGroupProgramBlock
{
    name = "group" as const;
    blocks: ProgramBlocks[] = []

    constructor(obj: IGroupProgramBlock)
    {
        super(obj);
        this.blocks = obj.blocks.map(b => ProgramBlockRegistry(b));
    }

    public async execute(): Promise<void> {

        LoggerInstance.info("GroupsBlock: Will execute " + this.blocks.length + " blocks.");
        for (const b of this.blocks) {
            await b.execute();
        }
    }
}
