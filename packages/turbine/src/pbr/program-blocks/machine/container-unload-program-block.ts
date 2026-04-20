import type { StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/parameter-block-hydrated";
import type { AllProgramBlocks, ContainerProductUnloadProgramBlock as ContainerProductUnloadProgramBlockSpec } from "$types/spec/cycle/program";
import type { PBRContext } from "../../../services/pbr-context";
import { ParameterBlockRegistry } from "../../parameter-blocks/parameter-block-registry";
import { ProgramBlock } from "../program-block";

export class ContainerProductUnloadProgramBlock extends ProgramBlock {
	containter_name: StringParameterBlockHydrated;

	constructor(obj: ContainerProductUnloadProgramBlockSpec, ctx: PBRContext) {
		super(obj, ctx);
		this.containter_name = ParameterBlockRegistry.String(obj.unload_container);
	}

	public async execute(): Promise<void> {
		const container_name = this.containter_name.data;

		this.ctx.logger.log("info", `SlotUnloadBlock: Will unload slot with name: ${container_name}.`);
		await this.ctx.containers.unload(container_name);

		super.execute();
	}

	static is_container_product_unload_pg_b(obj: AllProgramBlocks): obj is ContainerProductUnloadProgramBlockSpec {
		return (obj as ContainerProductUnloadProgramBlockSpec).unload_container !== undefined;
	}
}
