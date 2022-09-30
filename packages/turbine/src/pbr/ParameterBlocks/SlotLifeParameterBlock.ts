import { ISlotLifetimeParameterBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ParameterBlocks/ISlotLifetimeParameterBlock";
import { ParameterBlock } from ".";
import { SlotController } from "../../controllers/slot/SlotController";

export class SlotLifetimeParameterBlock extends ParameterBlock implements ISlotLifetimeParameterBlock
{
    name = "slotlife" as const;
    value: string;

    constructor(obj: ISlotLifetimeParameterBlock)
    {
        super(obj);

        this.value = obj.value;
    }

    public data(): number
    {
        return SlotController.getInstance().slots.find(s => s.name == this.value)?.productData?.lifetimeProgress ?? 0;
    }
}

