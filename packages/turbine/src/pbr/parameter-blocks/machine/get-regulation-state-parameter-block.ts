import type { StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/parameter-block-hydrated";
import type { AllParameterBlocks, GetRegulationStateParameterBlock as GetRegulationStateParameterBlockSpec } from "$types/spec/cycle/parameter";
import type { PBRContext } from "../../../services/pbr-context";
import { NumericParameterBlock } from "../numeric-parameter-block";
import { ParameterBlockRegistry } from "../parameter-block-registry";

export class GetRegulationStateParameterBlock extends NumericParameterBlock {
	private container: StringParameterBlockHydrated;
	private regulation: StringParameterBlockHydrated;
	private ctx: PBRContext;

	#state: boolean = false;

	constructor(obj: GetRegulationStateParameterBlockSpec, ctx: PBRContext) {
		super(obj);
		this.ctx = ctx;

		this.container = ParameterBlockRegistry.String(obj.get_regulation_state.container);
		this.regulation = ParameterBlockRegistry.String(obj.get_regulation_state.regulation);

		this.#state = this.ctx.containers.get_regulation_state(this.container.data, this.regulation.data);

		this.ctx.containers.on(`regulation.${this.container.data}.${this.regulation.data}.state_updated`, (state) => {
			this.#state = state;
		});
	}

	public get data(): number {
		return this.#state ? 1 : 0;
	}

	static is_get_regulation_state_pb(obj: AllParameterBlocks): obj is GetRegulationStateParameterBlockSpec {
		return (obj as GetRegulationStateParameterBlockSpec).get_regulation_state !== undefined;
	}
}
