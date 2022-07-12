import { ParameterBlock } from ".";
import { ProgramBlockRunner } from "../ProgramBlockRunner";
import { IProfileParameterBlock } from "../../interfaces/programblocks/ParameterBlocks/IProfileParameterBlock";

export class ProfileParameterBlock extends ParameterBlock implements IProfileParameterBlock
{
    name: "profile" = "profile";
    value: string;

    constructor(instance: ProgramBlockRunner, obj: IProfileParameterBlock)
    {
        super(instance);

        this.value = obj.value;
    }

    public data(): number
    {
        if(this.pbrInstance.profileExplorer !== undefined)
        {
            const val = this.pbrInstance.profileExplorer(this.value);
            if(val === undefined) this.pbrInstance.machine.logger.warn(`Profile row ${this.value} not found`);
            return val ? val : 0;
        }
        else
        {
            this.pbrInstance.machine.logger.warn("Profile not defined, returning 0");
            return 0;
        }
    }   
}

