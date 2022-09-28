import { ParameterBlock } from ".";
import { SlotController } from "../../controllers/slot/SlotController";
import { IParameterBlock } from "../../interfaces/IParameterBlock";
import { ProgramBlockRunner } from "../ProgramBlockRunner";

//Slot status shall only be used for startConditions
export class SlotProductStatusParameterBlock extends ParameterBlock implements ISlotProductStatusParameterBlock
{
    name = "slotstatus" as const;
    value: string;
    
    constructor(instance: ProgramBlockRunner, obj: ISlotProductStatusParameterBlock)
    {
        super(instance);

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

export interface ISlotProductStatusParameterBlock extends IParameterBlock
{
    name: "slotstatus"
    value: string;
}