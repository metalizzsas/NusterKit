import type { NumericParameterBlockHydrated, StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/parameter-block-hydrated";
import type { AllProgramBlocks, SetRegulationStateProgramBlock as SetRegulationStateProgramBlockSpec } from "$types/spec/cycle/program";
import type { PBRContext } from "../../../services/pbr-context";
import { ParameterBlockRegistry } from "../../parameter-blocks/parameter-block-registry";
import { ProgramBlock } from "../program-block";

export class SetRegulationStateProgramBlock extends ProgramBlock {
	container: StringParameterBlockHydrated;
	regulation: StringParameterBlockHydrated;
	state: NumericParameterBlockHydrated;

	constructor(obj: SetRegulationStateProgramBlockSpec, ctx: PBRContext) {
		super(obj, ctx);
		this.container = ParameterBlockRegistry.String(obj.set_regulation_state.container);
		this.regulation = ParameterBlockRegistry.String(obj.set_regulation_state.regulation);
		this.state = ParameterBlockRegistry.Numeric(obj.set_regulation_state.state);
	}

	public async execute(): Promise<void> {
		const container_name = this.container.data;
		const regulation_name = this.regulation.data;
		const target_state = this.state.data === 1;

		this.ctx.logger.log("info", `RegulationSetStateProgramBlock: Will set ${container_name} regulation ${regulation_name} to ${target_state}.`);
		const result = await this.ctx.containers.set_regulation_state(container_name, regulation_name, target_state);
		this.ctx.logger.log("info", `RegulationSetStateProgramBlock: Set ${container_name} regulation ${regulation_name} to ${result}.`);

		super.execute();
	}

	static is_set_regulation_state_pb(obj: AllProgramBlocks): obj is SetRegulationStateProgramBlockSpec {
		return (obj as SetRegulationStateProgramBlockSpec).set_regulation_state !== undefined;
	}
}
