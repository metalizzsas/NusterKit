import type { IProfileParameterBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ParameterBlocks/IProfileParameterBlock";
import { ParameterBlock } from ".";
import { LoggerInstance } from "../../app";
import { CycleController } from "../../controllers/cycle/CycleController";

export class ProfileParameterBlock extends ParameterBlock implements IProfileParameterBlock
{
    name = "profile" as const;
    value: string;

    constructor(obj: IProfileParameterBlock)
    {
        super(obj);
        this.value = obj.value;
    }

    public data(): number
    {
        const pbrInstance = CycleController.getInstance().program;

        if(pbrInstance?.profileExplorer !== undefined)
        {
            const val = pbrInstance.profileExplorer(this.value);
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

