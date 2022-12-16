import { StringParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllParameterBlocks, StringParameterBlock as StringParameterBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/IParameterBlocks";

export class StringParameterBlock extends StringParameterBlockHydrated
{
    #value: string;
    
    constructor(obj: StringParameterBlockSpec)
    {
        super(obj);
        this.#value = obj.string;
    }

    public get data(): string
    {
        return this.#value;
    }

    static isStringPB(obj: AllParameterBlocks): obj is StringParameterBlockSpec
    {
        return (obj as StringParameterBlockSpec).string !== undefined;
    }
}