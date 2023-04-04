import type { ParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllParameterBlocks } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ParameterBlocks";

export class ParameterBlock<T> implements ParameterBlockHydrated<T>
{
    name: string;

    constructor(obj: AllParameterBlocks)
    {
        this.name = Object.keys(obj)[0];
    }

    get data(): T
    {
        throw Error("Not implemented");
    }

    toJSON()
    {
        return {...this, pbrInstance: undefined, data: this.data }
    }
}