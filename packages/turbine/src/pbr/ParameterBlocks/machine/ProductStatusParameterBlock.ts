import type { ContainerHydrated } from "$types/hydrated/containers";
import type { StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllParameterBlocks, ProductStatusParameterBlock as ProductStatusParameterBlockSpec } from "$types/spec/cycle/parameter";
import { TurbineEventLoop } from "../../../events";
import { ParameterBlockRegistry } from "../ParameterBlockRegistry";
import { StatusParameterBlock } from "../StatusParameterBlock";

/** Slot status should be only used for security conditions */
export class ProductStatusParameterBlock extends StatusParameterBlock
{
    private containerName: StringParameterBlockHydrated;
    #container?: ContainerHydrated;
    
    constructor(obj: ProductStatusParameterBlockSpec)
    {
        super(obj);
        this.containerName = ParameterBlockRegistry.String(obj.product_status);

        TurbineEventLoop.on(`container.updated.${this.containerName.data}`, (container) => {
            this.#container = container;
            this.subscriber?.(this.data);
        });
        TurbineEventLoop.emit(`container.read.${this.containerName.data}`, { callback: (container) => {
            this.#container = container;
            this.subscriber?.(this.data);
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