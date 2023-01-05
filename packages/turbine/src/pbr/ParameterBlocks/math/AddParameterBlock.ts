import { NumericParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AddParameterBlock as AddParameterBlockSpec, AllParameterBlocks } from "@metalizzsas/nuster-typings/build/spec/cycle/blocks/ParameterBlocks";
import { ParameterBlockRegistry } from "../ParameterBlockRegistry";

export class AddParameterBlock extends NumericParameterBlockHydrated
{
    private numbers: Array<NumericParameterBlockHydrated>;

    constructor(obj: AddParameterBlockSpec)
    {
        super(obj);
        this.numbers = obj.add.map(p => ParameterBlockRegistry.Numeric(p));
    }

    public get data(): number
    {
        return this.numbers.reduce((acc, p) => acc + (p.data), 0);
    }

    static isAddPB(obj: AllParameterBlocks): obj is AddParameterBlockSpec
    {
        return (obj as AddParameterBlockSpec).add !== undefined;
    }
}