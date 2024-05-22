import type { ParameterBlockHydrated } from "$types/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllParameterBlocks } from "$types/spec/cycle/parameter";

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