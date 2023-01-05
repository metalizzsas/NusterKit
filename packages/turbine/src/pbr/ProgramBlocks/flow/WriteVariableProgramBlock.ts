import type { NumericParameterBlockHydrated, StringParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import { ProgramBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ProgramBlockHydrated";
import type { AllProgramBlocks, SetVariableProgramBlock as SetVariableProgramBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ProgramBlocks";
import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";
import { TurbineEventLoop } from "../../../events";

export class SetVariableProgramBlock extends ProgramBlockHydrated
{
    variableName: StringParameterBlockHydrated;
    variableValue: NumericParameterBlockHydrated;

    constructor(obj: SetVariableProgramBlockSpec) 
    {
        super(obj);

        this.variableName = ParameterBlockRegistry.String(obj.set_var[0]);
        this.variableValue = ParameterBlockRegistry.Numeric(obj.set_var[1]);
    }

    public async execute(): Promise<void> {

        TurbineEventLoop.emit(`pbr.variable.set.${this.variableName.data}`, this.variableValue.data);

        super.execute();           
    }

    static isSetVariablePgB(obj: AllProgramBlocks): obj is SetVariableProgramBlockSpec
    {
        return (obj as SetVariableProgramBlockSpec).set_var !== undefined;
    }
}


