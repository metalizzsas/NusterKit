import type { StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllParameterBlocks, ReadMachineVariableParameterBlock as ReadMachineVariableParameterBlockConfig } from "$types/spec/cycle/parameter";
import { ParameterBlockRegistry } from "../ParameterBlockRegistry";
import { TurbineEventLoop } from "../../../events";
import { NumericParameterBlock } from "../NumericParameterBlock";

export class ReadMachineVariableParameterBlock extends NumericParameterBlock
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

    public get data(): number
    {
        return this.#variableValue;
    }

    static isReadMachineVariablePB(obj: AllParameterBlocks): obj is ReadMachineVariableParameterBlockConfig
    {
        return (obj as ReadMachineVariableParameterBlockConfig).read_machine_var !== undefined;
    }
}