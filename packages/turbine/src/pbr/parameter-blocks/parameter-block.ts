import type { ParameterBlockHydrated } from "$types/hydrated/cycle/blocks/parameter-block-hydrated";
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

    /** Override in subclasses to remove event listeners */
    dispose(): void {}

    toJSON()
    {
        return {...this, pbrInstance: undefined, data: this.data }
    }
}