import { NumericParameterBlockHydrated, type StringParameterBlockHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllParameterBlocks, IOReadParameterBlock as IOReadParameterBlockSpec } from "@metalizzsas/nuster-typings/build/spec/cycle/IParameterBlocks";
import { IOController } from "../../../controllers/io/IOController";
import { ParameterBlockRegistry } from "../ParameterBlockRegistry";

export class IOReadParameterBlock extends NumericParameterBlockHydrated
{
    private gateName: StringParameterBlockHydrated;

    constructor(obj: IOReadParameterBlockSpec)
    {
        super(obj);
        this.gateName = ParameterBlockRegistry.String(obj.io_read);
    }

    public get data(): number
    {
        //TODO: Replace the singleton arch
        return IOController.getInstance().gFinder(this.gateName.data)?.value || 0;
    }

    static isIOReadPB(obj: AllParameterBlocks): obj is IOReadParameterBlockSpec
    {
        return (obj as IOReadParameterBlockSpec).io_read !== undefined;
    }
}

