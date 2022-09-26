import { ParameterBlock } from ".";
import { ProgramBlockRunner } from "../ProgramBlockRunner";
import { ISlotLifetimeParameterBlock } from "../../interfaces/programblocks/ParameterBlocks/ISlotLifetimeParameterBlock";

export class SlotLifetimeParameterBlock extends ParameterBlock implements ISlotLifetimeParameterBlock
{
    name = "slotlife" as const;
    value: string;

    constructor(instance: ProgramBlockRunner, obj: ISlotLifetimeParameterBlock)
    {
        super(instance);

        this.value = obj.value;
    }

    public data(): number
    {
        return this.pbrInstance.machine.slotController.slots.find(s => s.name == this.value)?.productData?.lifetimeProgress ?? 0;
    }
}

