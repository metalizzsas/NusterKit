import { ProgramBlock } from "./index";
import { StringParameterBlocks } from "../ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";
import { SlotController } from "../../controllers/slot/SlotController";
import { LoggerInstance } from "../../app";
import { ISlotLoadProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/ISlotLoadProgramBlock";

export class SlotLoadProgramBlock extends ProgramBlock implements ISlotLoadProgramBlock {
    
    name = "slotLoad" as const;
    params: [StringParameterBlocks];

    constructor(obj: ISlotLoadProgramBlock) 
    {
        super(obj);

        this.params = [ParameterBlockRegistry(obj.params[0]) as StringParameterBlocks];
    }

    public async execute(): Promise<void> {
        const slotName = this.params[0].data() as string;
        LoggerInstance.info("SlotLoadBlock: Will load slot with name: " + slotName);

        SlotController.getInstance().slots.find(s => s.name == slotName)?.loadSlot();

        this.executed = true;
    }
}

