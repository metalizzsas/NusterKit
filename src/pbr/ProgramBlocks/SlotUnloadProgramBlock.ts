import { ProgramBlock } from "./index";
import { ISlotUnloadProgramBlock } from "../../interfaces/programblocks/ProgramBlocks/ISlotUnloadProgramBlock";
import { StringParameterBlocks } from "../ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";
import { SlotController } from "../../controllers/slot/SlotController";
import { LoggerInstance } from "../../app";

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

