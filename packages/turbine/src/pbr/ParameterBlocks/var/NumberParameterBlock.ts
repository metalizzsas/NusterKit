import { NumericParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllParameterBlocks, NumberParameterBlock as NumberParameterBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ParameterBlocks";

export class NumberParameterBlock extends NumericParameterBlockHydrated
{
    #value: number;

    constructor(obj: NumberParameterBlockSpec)
    {
        super(obj);
        this.#value = obj.number;
    }

    public get data(): number
    {
        return this.#value;
    }

    static isNumberPB(obj: AllParameterBlocks): obj is NumberParameterBlockSpec
    {
        return (obj as NumberParameterBlockSpec).number !== undefined;
    }
}

