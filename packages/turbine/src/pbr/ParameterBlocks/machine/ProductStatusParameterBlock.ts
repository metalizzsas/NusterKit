import { StatusParameterBlockHydrated, type StringParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllParameterBlocks, ProductStatusParameterBlock as ProductStatusParameterBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/IParameterBlocks";
import { SlotController } from "../../../controllers/slot/SlotController";
import { ParameterBlockRegistry } from "../ParameterBlockRegistry";

/** Slot status should be only used for security conditions */
export class ProductStatusParameterBlock extends StatusParameterBlockHydrated
{
    private containerName: StringParameterBlockHydrated;
    
    constructor(obj: ProductStatusParameterBlockSpec)
    {
        super(obj);
        this.containerName = ParameterBlockRegistry.String(obj.product_status);
    }

    public get data(): "error" | "warning" | "good"
    {
        const containerNameData = this.containerName.data;

        const slot = SlotController.getInstance().slots.find(s => s.name == containerNameData);

        // Slot is not defined
        if(slot === undefined)
            return "error";

        // Slot has not product loaded
        if(slot.productData === undefined)
            return "error";

        // Slot lifetime remaining is undefined
        if(slot.productData?.lifetimeRemaining === undefined)
            return "error";

        // slot lifespan remaining is under 1 second
        if(slot.productData?.lifetimeRemaining < 1)
            return "warning";
        
        return "good";
    }

    static isProductStatusPB(obj: AllParameterBlocks): obj is ProductStatusParameterBlockSpec
    {
        return (obj as ProductStatusParameterBlockSpec).product_status !== undefined;
    }
}