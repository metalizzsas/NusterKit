import type { StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllParameterBlocks, GetRegulationStateParameterBlock as GetRegulationStateParameterBlockSpec } from "$types/spec/cycle/parameter";
import { ParameterBlockRegistry } from "../ParameterBlockRegistry";
import { TurbineEventLoop } from "../../../events";
import { NumericParameterBlock } from "../NumericParameterBlock";

export class GetRegulationStateParameterBlock extends NumericParameterBlock
{
    private container: StringParameterBlockHydrated;
    private regulation: StringParameterBlockHydrated;

    #state: boolean = false;

    constructor(obj: GetRegulationStateParameterBlockSpec)
    {
        super(obj);

        this.container = ParameterBlockRegistry.String(obj.get_regulation_state.container);
        this.regulation = ParameterBlockRegistry.String(obj.get_regulation_state.regulation);

        //first read
        TurbineEventLoop.emit(`container.${this.container.data}.regulation.${this.regulation.data}.get_state`, ({ callback: (state) => {
            this.#state = state;
        }}));

        // keep updated for state changes
        TurbineEventLoop.on(`container.${this.container.data}.regulation.${this.regulation.data}.state_updated`, (state) => {
            this.#state = state;
        });
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

