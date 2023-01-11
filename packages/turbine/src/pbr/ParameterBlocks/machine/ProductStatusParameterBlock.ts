import type { ContainerHydrated } from "@metalizzsas/nuster-typings/build/hydrated/containers";
import { StatusParameterBlockHydrated, type StringParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllParameterBlocks, ProductStatusParameterBlock as ProductStatusParameterBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ParameterBlocks";
import { TurbineEventLoop } from "../../../events";
import { ParameterBlockRegistry } from "../ParameterBlockRegistry";

/** Slot status should be only used for security conditions */
export class ProductStatusParameterBlock extends StatusParameterBlockHydrated
{
    private containerName: StringParameterBlockHydrated;
    #container?: ContainerHydrated;
    
    constructor(obj: ProductStatusParameterBlockSpec)
    {
        super(obj);
        this.containerName = ParameterBlockRegistry.String(obj.product_status);

        TurbineEventLoop.on(`container.updated.${this.containerName.data}`, (container) => this.#container = container);
        TurbineEventLoop.emit(`container.read.${this.containerName.data}`, { callback: (container) => {
            this.#container = container;
        }});
    }

    public get data(): "error" | "warning" | "good"
    {
        // Slot is not defined
        if(this.#container === undefined)
            return "error";

        // Slot has not product loaded
        if(this.#container.productData === undefined)
            return "error";

        // Slot lifetime remaining is undefined
        if(this.#container.productData?.lifetimeRemaining === undefined)
            return "error";

        // slot lifespan remaining is under 1 second
        if(this.#container.productData?.lifetimeRemaining < 1)
            return "warning";
        
        return "good";
    }

    static isProductStatusPB(obj: AllParameterBlocks): obj is ProductStatusParameterBlockSpec
    {
        return (obj as ProductStatusParameterBlockSpec).product_status !== undefined;
    }
}