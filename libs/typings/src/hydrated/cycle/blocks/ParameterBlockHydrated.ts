import { AllParameterBlocks } from "../../../spec/cycle/IParameterBlocks";
import { IProgramBlockRunnerHydrated } from "../IProgramBlockRunnerHydrated";

export class ParameterBlockHydrated<T>
{
    readonly name: string;
    protected pbrInstance?: IProgramBlockRunnerHydrated;

    constructor(obj: AllParameterBlocks, pbrInstance?: IProgramBlockRunnerHydrated)
    {
        this.name = Object.keys(obj)[0];
        this.pbrInstance = pbrInstance;
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
    constructor(obj: AllParameterBlocks, pbrInstance?: IProgramBlockRunnerHydrated)
    {
        super(obj, pbrInstance);
    }
}

export class NumericParameterBlockHydrated extends ParameterBlockHydrated<number>
{
    constructor(obj: AllParameterBlocks, pbrInstance?: IProgramBlockRunnerHydrated)
    {
        super(obj, pbrInstance);
    }
}

export class StatusParameterBlockHydrated extends ParameterBlockHydrated<"error" | "warning" | "good">
{
    constructor(obj: AllParameterBlocks, pbrInstance?: IProgramBlockRunnerHydrated)
    {
        super(obj, pbrInstance);
    }
}