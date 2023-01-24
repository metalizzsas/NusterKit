import type { StringParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllParameterBlocks, ReadVariableParameterBlock as ReadVariableParameterBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlockRegistry";
import { TurbineEventLoop } from "../../../events";
import { NumericParameterBlock } from "../NumericParameterBlock";

export class ReadVariableParameterBlock extends NumericParameterBlock
{
    private variableName: StringParameterBlockHydrated;

    #variableValue = 0;

    constructor(obj: ReadVariableParameterBlockSpec)
    {
        super(obj);
        this.variableName = ParameterBlockRegistry.String(obj.read_var);

        TurbineEventLoop.emit('pbr.variable.read', { name: this.variableName.data });
        TurbineEventLoop.on('pbr.variable.write', ({ name, value }) => {
            if(name === this.variableName.data)
                this.#variableValue = value;
        });
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