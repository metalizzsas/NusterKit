import { ParameterBlock } from ".";
import { ProgramBlockRunner } from "../ProgramBlockRunner";
import { IIOReadParameterBlock } from "../../interfaces/programblocks/ParameterBlocks/IIOReadParameterBlock";

export class IOReadParameterBlock extends ParameterBlock implements IIOReadParameterBlock
{
    name: "io" = "io";
    value: string;

    constructor(instance: ProgramBlockRunner, obj: IIOReadParameterBlock)
    {
        super(instance);

        this.value = obj.value;
    }

    public data(): number
    {
        return this.pbrInstance.ioExplorer(this.value)?.value || 0;
    }
}

