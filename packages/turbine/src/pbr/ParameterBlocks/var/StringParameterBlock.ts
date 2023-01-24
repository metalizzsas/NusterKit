import type { AllParameterBlocks, StringParameterBlock as StringParameterBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ParameterBlocks";
import { StringParameterBlock as StringParameterBlockType } from "../StringParameterBlock";

export class StringParameterBlock extends StringParameterBlockType
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