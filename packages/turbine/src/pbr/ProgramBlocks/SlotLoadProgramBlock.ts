import { ProgramBlock } from "./index";
import type { StringParameterBlocks } from "../ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";
import { SlotController } from "../../controllers/slot/SlotController";
import { LoggerInstance } from "../../app";
import type { ISlotLoadProgramBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ProgramBlocks/ISlotLoadProgramBlock";
import type { EProductSeries } from "@metalizzsas/nuster-typings/build/spec/slot/products";

export class SlotLoadProgramBlock extends ProgramBlock implements ISlotLoadProgramBlock {
    
    name = "slotLoad" as const;
    params: [StringParameterBlocks, StringParameterBlocks];

    constructor(obj: ISlotLoadProgramBlock) 
    {
        super(obj);

        this.params = [ParameterBlockRegistry(obj.params[0]) as StringParameterBlocks, ParameterBlockRegistry(obj.params[1]) as StringParameterBlocks];
    }

    public async execute(): Promise<void> {
        const slotName = this.params[0].data() as string;
        const slotProductSeries = this.params[1].data() as EProductSeries;
        LoggerInstance.info("SlotLoadBlock: Will load slot with name: " + slotName);

        SlotController.getInstance().slots.find(s => s.name == slotName)?.loadSlot(slotProductSeries);

        this.executed = true;
    }
}

