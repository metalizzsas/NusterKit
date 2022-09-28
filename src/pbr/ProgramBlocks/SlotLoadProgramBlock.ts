
import { ProgramBlockRunner } from "../ProgramBlockRunner";
import { ProgramBlock } from "./index";
import { ISlotLoadProgramBlock } from "../../interfaces/programblocks/ProgramBlocks/ISlotLoadProgramBlock";
import { StringParameterBlocks } from "../ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";
import { SlotController } from "../../controllers/slot/SlotController";
import { LoggerInstance } from "../../app";

export class SlotLoadProgramBlock extends ProgramBlock implements ISlotLoadProgramBlock {
    
    name = "slotLoad" as const;
    params: [StringParameterBlocks];

    constructor(pbrInstance: ProgramBlockRunner, obj: ISlotLoadProgramBlock) 
    {
        super(pbrInstance, obj);

        this.params = [ParameterBlockRegistry(pbrInstance, obj.params[0]) as StringParameterBlocks];
    }

    public async execute(): Promise<void> {
        const slotName = this.params[0].data() as string;
        LoggerInstance.info("SlotLoadBlock: Will load slot with name: " + slotName);

        SlotController.getInstance().slots.find(s => s.name == slotName)?.loadSlot();

        this.executed = true;
    }
}

