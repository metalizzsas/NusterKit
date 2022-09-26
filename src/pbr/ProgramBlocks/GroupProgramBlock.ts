import { ProgramBlockRunner } from "../ProgramBlockRunner";
import { IGroupProgramBlock } from "../../interfaces/programblocks/ProgramBlocks/IGroupProgramBlock";
import { ProgramBlock, ProgramBlocks } from "./index";

export class GroupProgramBlock extends ProgramBlock implements IGroupProgramBlock
{
    name = "group" as const;
    blocks: ProgramBlocks[] = []

    constructor(pbrInstance: ProgramBlockRunner, obj: IGroupProgramBlock)
    {
        super(pbrInstance, obj);

        super.fillProgramBlocks(obj);
    }

    public async execute(): Promise<void> {

        this.pbrInstance.machine.logger.info("GroupsBlock: Will execute " + this.blocks.length + " blocks.");
        for (const b of this.blocks) {
            await b.execute();
        }
    }
}

