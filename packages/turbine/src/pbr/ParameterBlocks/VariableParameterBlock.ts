import type { IVariableParameterBlock } from "@metalizzsas/nuster-typings/build/spec/cycle/programblocks/ParameterBlocks/IVariableParameterBlock";
import { ParameterBlock } from ".";
import { LoggerInstance } from "../../app";
import { CycleController } from "../../controllers/cycle/CycleController";

export class VariableParameterBlock extends ParameterBlock implements IVariableParameterBlock
{
    name = "variable" as const;
    value: string;
    constructor(obj: IVariableParameterBlock)
    {
        super(obj);

        this.value = obj.value;
    }

    public data(): number
    {
        const pbrInstance = CycleController.getInstance().program;
        if(pbrInstance !== undefined)
        {
            if(this.value == "currentStepIndex")
                return pbrInstance.currentStepIndex;
            else if(this.value == "currentStepRunCount")
            {
                const step = pbrInstance.steps[pbrInstance.currentStepIndex];
                if(step)
                {
                    const rc = step.runCount;
                    return (rc !== undefined) ? rc : 0;
                }
                return 0;
            } 
            else
            {
                LoggerInstance.warn(`The variable ${this.value} is not defined.`);
                return pbrInstance.variables.find(v => v.name == this.value)?.value ?? 0; // this variable might have never been defined
            }
        }

        throw new Error("Variable: Failed to get data, pbr instance is not defined")
    }
}

