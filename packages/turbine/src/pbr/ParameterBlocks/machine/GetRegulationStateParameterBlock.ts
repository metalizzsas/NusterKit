import type { StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllParameterBlocks, GetRegulationStateParameterBlock as GetRegulationStateParameterBlockSpec } from "$types/spec/cycle/parameter";
import type { PBRContext } from "../../../services/PBRContext";
import { ParameterBlockRegistry } from "../ParameterBlockRegistry";
import { TurbineEventLoop } from "../../../events";
import { NumericParameterBlock } from "../NumericParameterBlock";

export class GetRegulationStateParameterBlock extends NumericParameterBlock
{
    private container: StringParameterBlockHydrated;
    private regulation: StringParameterBlockHydrated;
    private ctx?: PBRContext;

    #state: boolean = false;

    constructor(obj: GetRegulationStateParameterBlockSpec, ctx?: PBRContext)
    {
        super(obj);
        this.ctx = ctx;

        this.container = ParameterBlockRegistry.String(obj.get_regulation_state.container);
        this.regulation = ParameterBlockRegistry.String(obj.get_regulation_state.regulation);

        if(this.ctx)
        {
            // first read
            this.#state = this.ctx.containers.getRegulationState(this.container.data, this.regulation.data);

            // keep updated for state changes
            this.ctx.containers.on(`regulation.${this.container.data}.${this.regulation.data}.state_updated`, (state) => {
                this.#state = state;
            });
        }
        else
        {
            //first read
            TurbineEventLoop.emit(`container.${this.container.data}.regulation.${this.regulation.data}.get_state`, ({ callback: (state) => {
                this.#state = state;
            }}));

            // keep updated for state changes
            TurbineEventLoop.on(`container.${this.container.data}.regulation.${this.regulation.data}.state_updated`, (state) => {
                this.#state = state;
            });
        }
    }

    public get data(): number
    {
        return this.#state ? 1 : 0;
    } 

    static isGetRegulationStatePB(obj: AllParameterBlocks): obj is GetRegulationStateParameterBlockSpec
    {
        return (obj as GetRegulationStateParameterBlockSpec).get_regulation_state !== undefined;
    }
}

