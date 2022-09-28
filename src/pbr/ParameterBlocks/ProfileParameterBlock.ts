import { ParameterBlock } from ".";
import { ProgramBlockRunner } from "../ProgramBlockRunner";
import { IProfileParameterBlock } from "../../interfaces/programblocks/ParameterBlocks/IProfileParameterBlock";
import { LoggerInstance } from "../../app";

export class ProfileParameterBlock extends ParameterBlock implements IProfileParameterBlock
{
    name = "profile" as const;
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
            if(val === undefined) 
            {
                LoggerInstance.warn(`Profile row ${this.value} not found, returning 0`);
                return 0;
            }

            if(val === true)
                return 1;
            else if(val === false)
                return 0;
            else
                return val;
        }
        else
        {
            LoggerInstance.warn("Profile not defined, returning 0");
            return 0;
        }
    }   
}

