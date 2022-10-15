import type { ISlotProductStatusParameterBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ParameterBlocks/ISlotProductStatusParameterBlock";
import { ParameterBlock } from ".";
import { SlotController } from "../../controllers/slot/SlotController";

//Slot status shall only be used for startConditions
export class SlotProductStatusParameterBlock extends ParameterBlock implements ISlotProductStatusParameterBlock
{
    name = "slotstatus" as const;
    value: string;
    
    constructor(obj: ISlotProductStatusParameterBlock)
    {
        super(obj);

        this.value = obj.value;
    }

    public data(): string
    {
        const slot = SlotController.getInstance().slots.find(s => s.name == this.value);

        if(slot && slot.productData?.lifetimeRemaining !== undefined)
        {
            if(slot.productData.lifetimeRemaining > 0)
                return "good";
            else
                return "warning";
        }
        else
        {
            return "error";
        }
    }
}