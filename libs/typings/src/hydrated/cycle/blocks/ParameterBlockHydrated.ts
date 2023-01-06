import type { AllParameterBlocks } from "../../../spec/cycle/blocks/ParameterBlocks";

export class ParameterBlockHydrated<T>
{
    readonly name: string;

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
        return {...this, pbrInstance: undefined, data: this.data}
    }
}

export class StringParameterBlockHydrated extends ParameterBlockHydrated<string>
{
    constructor(obj: AllParameterBlocks)
    {
        super(obj);
    }
}

export class NumericParameterBlockHydrated extends ParameterBlockHydrated<number>
{
    constructor(obj: AllParameterBlocks)
    {
        super(obj);
    }
}

export class StatusParameterBlockHydrated extends ParameterBlockHydrated<"error" | "warning" | "good">
{
    constructor(obj: AllParameterBlocks)
    {
        super(obj);
    }
}