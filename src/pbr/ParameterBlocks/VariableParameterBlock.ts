import { ParameterBlock } from ".";
import { ProgramBlockRunner } from "../ProgramBlockRunner";
import { IVariableParameterBlock } from "../../interfaces/programblocks/ParameterBlocks/IVariableParameterBlock";

export class VariableParameterBlock extends ParameterBlock implements IVariableParameterBlock
{
    name = "variable" as const;
    value: string;
    constructor(instance: ProgramBlockRunner, obj: IVariableParameterBlock)
    {
        super(instance);

        this.value = obj.value;
    }

    public data(): number
    {
        if(this.value == "currentStepIndex")
            return this.pbrInstance.currentStepIndex;
        else if(this.value == "currentStepRunCount")
        {
            const step = this.pbrInstance.steps[this.pbrInstance.currentStepIndex];
            if(step)
            {
                const rc = step.runCount;
                return (rc !== undefined) ? rc : 0;
            }
            return 0;
        } 
        else
        {
            this.pbrInstance.machine.logger.warn(`The variable ${this.value} is not defined.`);
            return this.pbrInstance.variables.find(v => v.name == this.value)?.value ?? 0; // this variable might have never been defined
        }
    }
}

