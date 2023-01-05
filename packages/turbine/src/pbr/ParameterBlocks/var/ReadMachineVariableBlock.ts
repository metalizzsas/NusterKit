import { NumericParameterBlockHydrated, type StringParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllParameterBlocks, ReadMachineVariableParameterBlock as ReadMachineVariableParameterBlockConfig, ReadVariableParameterBlock as ReadVariableParameterBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlockRegistry";
import { TurbineEventLoop } from "../../../events";

export class ReadMachineVariableParameterBlock extends NumericParameterBlockHydrated
{
    private machineVariableName: StringParameterBlockHydrated;

    #variableValue = 0;

    constructor(obj: ReadMachineVariableParameterBlockConfig)
    {
        super(obj);

        this.machineVariableName = ParameterBlockRegistry.String(obj.read_machine_var);

        TurbineEventLoop.emit(`machine.read_variable.${this.machineVariableName.data}`, { callback: (value) => {
            this.#variableValue = value;
        }});
    }

    public get value(): number
    {
        return this.#variableValue;
    }

    static isReadMachineVariablePB(obj: AllParameterBlocks): obj is ReadMachineVariableParameterBlockConfig
    {
        return (obj as ReadMachineVariableParameterBlockConfig).read_machine_var !== undefined;
    }
}