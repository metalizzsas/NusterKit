import type { StatusParameterBlocks } from "$types/spec/cycle/parameter";
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