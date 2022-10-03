import { ISlotUnloadProgramBlock } from "@metalizzsas/nuster-typings/src/spec/cycle/programblocks/ProgramBlocks/ISlotUnloadProgramBlock";
import { LoggerInstance } from "../../app";
import { SlotController } from "../../controllers/slot/SlotController";
import { StringParameterBlocks } from "../ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";
import { ProgramBlock } from "./index";

export class SlotUnloadProgramBlock extends ProgramBlock implements ISlotUnloadProgramBlock 
{
    name = "slotUnload" as const;
    params: [StringParameterBlocks];

    constructor(obj: ISlotUnloadProgramBlock)
    {
        super(obj);
        this.params = [ParameterBlockRegistry(obj.params[0]) as StringParameterBlocks];
    }

    public async execute(): Promise<void>
    {
        const slotName = this.params[0].data();
        LoggerInstance.info("SlotUnloadBlock: Will unload slot with name: " + slotName);

        SlotController.getInstance().slots.find(s => s.name == slotName)?.unloadSlot();

        this.executed = true;
    }
}

