
import { ProgramBlockRunner } from "../ProgramBlockRunner";
import { ProgramBlock } from "./index";
import { ISlotLoadProgramBlock } from "../../interfaces/programblocks/ProgramBlocks/ISlotLoadProgramBlock";
import { StringParameterBlocks } from "../ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";

export class SlotLoadProgramBlock extends ProgramBlock implements ISlotLoadProgramBlock {
    
    name: "slotLoad" = "slotLoad";
    params: [StringParameterBlocks];

    constructor(pbrInstance: ProgramBlockRunner, obj: ISlotLoadProgramBlock) 
    {
        super(pbrInstance, obj);

        this.params = [ParameterBlockRegistry(pbrInstance, obj.params[0]) as StringParameterBlocks];
    }

    public async execute(): Promise<void> {
        const sN = this.params[0].data() as string;
        this.pbrInstance.machine.logger.info("SlotLoadBlock: Will load slot with name: " + sN);

        this.pbrInstance.machine.slotController.slots.find(s => s.name == sN)?.loadSlot();
    }
}

