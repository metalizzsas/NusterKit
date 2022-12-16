import type { NumericParameterBlockHydrated, StringParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import { ProgramBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ProgramBlockHydrated";
import type { AllProgramBlocks, SetVariableProgramBlock as SetVariableProgramBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/IProgramBlocks";
import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";
import { PBRMissingError } from "../../PBRMissingError";
import type { ProgramBlockRunner } from "../../ProgramBlockRunner";

export class SetVariableProgramBlock extends ProgramBlockHydrated
{
    variableName: StringParameterBlockHydrated;
    variableValue: NumericParameterBlockHydrated;

    constructor(obj: SetVariableProgramBlockSpec, pbrInstance?: ProgramBlockRunner) 
    {
        super(obj, pbrInstance);

        this.variableName = ParameterBlockRegistry.String(obj.set_var[0]);
        this.variableValue = ParameterBlockRegistry.Numeric(obj.set_var[1]);
    }

    public async execute(): Promise<void> {

        if(this.pbrInstance === undefined)
            throw new PBRMissingError("VariableBlock");
        
        const variableName = this.variableName.data;
        const variableValue = this.variableValue.data;

        const referenceIndex = this.pbrInstance.variables.findIndex((v) => v.name == variableName);

        if (referenceIndex != -1)
            this.pbrInstance.variables[referenceIndex].value = variableValue;
        else
            this.pbrInstance.variables.push({ name: variableName, value: variableValue });

        super.execute();           
    }

    static isSetVariablePgB(obj: AllProgramBlocks): obj is SetVariableProgramBlockSpec
    {
        return (obj as SetVariableProgramBlockSpec).set_var !== undefined;
    }
}


