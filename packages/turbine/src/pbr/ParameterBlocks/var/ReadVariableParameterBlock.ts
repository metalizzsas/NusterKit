import { NumericParameterBlockHydrated, type StringParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllParameterBlocks, ReadVariableParameterBlock as ReadVariableParameterBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/IParameterBlocks";
import { LoggerInstance } from "../../../app";
import { PBRMissingError } from "../../PBRMissingError";
import type { ProgramBlockRunner } from "../../ProgramBlockRunner";
import { ParameterBlockRegistry } from "../ParameterBlockRegistry";

export class ReadVariableParameterBlock extends NumericParameterBlockHydrated
{
    private variableName: StringParameterBlockHydrated;

    constructor(obj: ReadVariableParameterBlockSpec, pbrInstance?: ProgramBlockRunner)
    {
        super(obj, pbrInstance);
        this.variableName = ParameterBlockRegistry.String(obj.read_var);
    }

    public get data(): number
    {
        const variableName = this.variableName.data;

        if(this.pbrInstance === undefined)
            throw new PBRMissingError("Read variable");
        
        if(variableName == "currentStepIndex")
            return this.pbrInstance.currentStepIndex;

        if(variableName == "currentStepRunCount")
        {
            const step = this.pbrInstance.currentRunningStep;
            if(step)
            {
                const rc = step.runCount;
                return (rc !== undefined) ? rc : 0;
            }
            return 0;
        }

        const variable = this.pbrInstance.variables.find(v => v.name == variableName);

        if(variable === undefined)
        {
            LoggerInstance.warn(`The variable ${variableName} is not defined.`);
            return 0;
        }

        return variable.value;
    }

    static isReadVariablePB(obj: AllParameterBlocks): obj is ReadVariableParameterBlockSpec
    {
        return (obj as ReadVariableParameterBlockSpec).read_var !== undefined;
    }
}