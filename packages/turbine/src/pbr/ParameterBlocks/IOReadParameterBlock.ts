import type { IIOReadParameterBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ParameterBlocks/IIOReadParameterBlock";
import { ParameterBlock } from ".";
import { IOController } from "../../controllers/io/IOController";

export class IOReadParameterBlock extends ParameterBlock implements IIOReadParameterBlock
{
    name = "io" as const;
    value: string;

    constructor(obj: IIOReadParameterBlock)
    {
        super(obj);
        this.value = obj.value;
    }

    public data(): number
    {
        return IOController.getInstance().gFinder(this.value)?.value || 0;
    }
}

