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
    private _onGateUpdate!: (gate: { value: number }) => void;

    constructor(obj: IOReadParameterBlockSpec, ctx?: PBRContext)
    {
        super(obj);
        this.ctx = ctx;
        this.gateName = ParameterBlockRegistry.String(obj.io_read);

        this._onGateUpdate = (gate: { value: number }) => {
            this.#gateValue = gate.value;
        };

        if(this.ctx)
        {
            this.ctx.io.on(`updated.${this.gateName.data}`, this._onGateUpdate);
        }
        else
        {
            TurbineEventLoop.on(`io.updated.${this.gateName.data}`, this._onGateUpdate);
        }
    }

    public get data(): number
    {
        return this.#gateValue;
    }

    dispose(): void {
        if (this.ctx) {
            this.ctx.io.off(`updated.${this.gateName.data}`, this._onGateUpdate);
        } else {
            TurbineEventLoop.removeListener(`io.updated.${this.gateName.data}`, this._onGateUpdate);
        }
    }

    static isIOReadPB(obj: AllParameterBlocks): obj is IOReadParameterBlockSpec
    {
        return (obj as IOReadParameterBlockSpec).io_read !== undefined;
    }
}