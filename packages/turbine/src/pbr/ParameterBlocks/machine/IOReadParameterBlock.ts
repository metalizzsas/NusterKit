import type { StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllParameterBlocks, IOReadParameterBlock as IOReadParameterBlockSpec } from "$types/spec/cycle/parameter";
import type { PBRContext } from "../../../services/PBRContext";
import { ParameterBlockRegistry } from "../ParameterBlockRegistry";
import { TurbineEventLoop } from "../../../events";
import { NumericParameterBlock } from "../NumericParameterBlock";

export class IOReadParameterBlock extends NumericParameterBlock
{
    private gateName: StringParameterBlockHydrated;
    private ctx?: PBRContext;
    #gateValue = 0;

    constructor(obj: IOReadParameterBlockSpec, ctx?: PBRContext)
    {
        super(obj);
        this.ctx = ctx;
        this.gateName = ParameterBlockRegistry.String(obj.io_read);

        if(this.ctx)
        {
            this.ctx.io.on(`updated.${this.gateName.data}`, (gate) => {
                this.#gateValue = gate.value;
            });
        }
        else
        {
            TurbineEventLoop.on(`io.updated.${this.gateName.data}`, (gate) => {
                this.#gateValue = gate.value;
            });
        }
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