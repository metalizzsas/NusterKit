import type { StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllParameterBlocks, IOReadParameterBlock as IOReadParameterBlockSpec } from "$types/spec/cycle/parameter";
import { ParameterBlockRegistry } from "../ParameterBlockRegistry";
import { TurbineEventLoop } from "../../../events";
import { NumericParameterBlock } from "../NumericParameterBlock";

export class IOReadParameterBlock extends NumericParameterBlock
{
    private gateName: StringParameterBlockHydrated;
    #gateValue = 0;

    constructor(obj: IOReadParameterBlockSpec)
    {
        super(obj);
        this.gateName = ParameterBlockRegistry.String(obj.io_read);

        TurbineEventLoop.on(`io.updated.${this.gateName.data}`, (gate) => {
            this.#gateValue = gate.value;
        });
    }

    public get data(): number
    {
        return this.#gateValue;
    }

    static isIOReadPB(obj: AllParameterBlocks): obj is IOReadParameterBlockSpec
    {
        return (obj as IOReadParameterBlockSpec).io_read !== undefined;
    }
}