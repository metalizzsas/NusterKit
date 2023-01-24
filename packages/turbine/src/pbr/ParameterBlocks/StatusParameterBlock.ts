import type { StatusParameterBlocks } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ParameterBlocks";
import { ParameterBlock } from "./ParameterBlock";

export class StatusParameterBlock extends ParameterBlock<"error" | "warning" | "good">
{
    subscriber: ((data: "error" | "warning" | "good") => void) | undefined;

    constructor(obj: StatusParameterBlocks)
    {
        super(obj);
    }

    /** Subscribe to block data change */
    subscribe(callback: (data: "error" | "warning" | "good") => void)
    {
        this.subscriber = callback;
    }
}