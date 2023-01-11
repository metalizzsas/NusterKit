import { NumericParameterBlockHydrated, type StringParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllParameterBlocks, ReadVariableParameterBlock as ReadVariableParameterBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlockRegistry";
import { TurbineEventLoop } from "../../../events";

export class ReadVariableParameterBlock extends NumericParameterBlockHydrated
{
    private variableName: StringParameterBlockHydrated;

    #variableValue = 0;

    constructor(obj: ReadVariableParameterBlockSpec)
    {
        super(obj);
        this.variableName = ParameterBlockRegistry.String(obj.read_var);
        TurbineEventLoop.on(`pbr.variable.set.${this.variableName.data}`, (value) => this.#variableValue = value);
        
        TurbineEventLoop.emit(`pbr.variable.read.${this.variableName.data}`, { callback: (value) => {
            this.#variableValue = value;
        }});
    }

    public get data(): number
    {
        return this.#variableValue;
    }

    static isReadVariablePB(obj: AllParameterBlocks): obj is ReadVariableParameterBlockSpec
    {
        return (obj as ReadVariableParameterBlockSpec).read_var !== undefined;
    }
}