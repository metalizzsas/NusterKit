import type { StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllParameterBlocks, ReadMachineVariableParameterBlock as ReadMachineVariableParameterBlockConfig } from "$types/spec/cycle/parameter";
import type { PBRContext } from "../../../services/PBRContext";
import { ParameterBlockRegistry } from "../ParameterBlockRegistry";
import { TurbineEventLoop } from "../../../events";
import { NumericParameterBlock } from "../NumericParameterBlock";

export class ReadMachineVariableParameterBlock extends NumericParameterBlock
{
    private machineVariableName: StringParameterBlockHydrated;
    private ctx?: PBRContext;

    #variableValue = 0;

    constructor(obj: ReadMachineVariableParameterBlockConfig, ctx?: PBRContext)
    {
        super(obj);
        this.ctx = ctx;

        this.machineVariableName = ParameterBlockRegistry.String(obj.read_machine_var);

        if(this.ctx)
        {
            this.#variableValue = this.ctx.machine.readVariable(this.machineVariableName.data);
        }
        else
        {
            TurbineEventLoop.emit(`machine.read_variable.${this.machineVariableName.data}`, { callback: (value) => {
                this.#variableValue = value;
            }});
        }
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