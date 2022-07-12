import { ProgramBlockRunner } from "../ProgramBlockRunner";
import { ProgramBlock } from "./index";
import { ISlotUnloadProgramBlock } from "../../interfaces/programblocks/ProgramBlocks/ISlotUnloadProgramBlock";
import { StringParameterBlocks } from "../ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlocks/ParameterBlockRegistry";

export class SlotUnloadProgramBlock extends ProgramBlock implements ISlotUnloadProgramBlock 
{
    name: "slotUnload" = "slotUnload";
    params: [StringParameterBlocks];

    constructor(pbrInstance: ProgramBlockRunner, obj: ISlotUnloadProgramBlock)
    {
        super(pbrInstance, obj);
        this.params = [ParameterBlockRegistry(pbrInstance, obj.params[0]) as StringParameterBlocks];
    }

    public async execute(): Promise<void>
    {
        const sN = this.params[0].data();
        this.pbrInstance.machine.logger.info("SlotUnloadBlock: Will unload slot with name: " + sN);

        this.pbrInstance.machine.slotController.slots.find(s => s.name == sN)?.unloadSlot();
    }
}

