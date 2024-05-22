import type { NumericParameterBlockHydrated, StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllProgramBlocks, SetVariableProgramBlock as SetVariableProgramBlockSpec } from "$types/spec/cycle/program";
import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";
import { TurbineEventLoop } from "../../../events";
import { ProgramBlock } from "../ProgramBlock";

export class SetVariableProgramBlock extends ProgramBlock
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

        TurbineEventLoop.emit(`pbr.variable.write`, { name: this.variableName.data, value: this.variableValue.data });

        super.execute();           
    }

    static isSetVariablePgB(obj: AllProgramBlocks): obj is SetVariableProgramBlockSpec
    {
        return (obj as SetVariableProgramBlockSpec).set_var !== undefined;
    }
}


