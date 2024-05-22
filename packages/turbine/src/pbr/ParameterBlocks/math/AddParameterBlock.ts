import type { NumericParameterBlockHydrated } from "$types/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AddParameterBlock as AddParameterBlockSpec, AllParameterBlocks } from "$types/spec/cycle/parameter";
import { ParameterBlockRegistry } from "../ParameterBlockRegistry";
import { NumericParameterBlock } from "../NumericParameterBlock";

export class AddParameterBlock extends NumericParameterBlock
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