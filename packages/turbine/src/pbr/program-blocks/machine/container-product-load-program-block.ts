import type { StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/parameter-block-hydrated";
import type { AllProgramBlocks, ContainerProductLoadProgramBlock as ContainerProductLoadProgramBlockSpec } from "$types/spec/cycle/program";
import type { PBRContext } from "../../../services/pbr-context";
import { ParameterBlockRegistry } from "../../parameter-blocks/parameter-block-registry";
import { ProgramBlock } from "../program-block";

export class ContainerProductLoadProgramBlock extends ProgramBlock {
	executed = false;

	container_name: StringParameterBlockHydrated;
	container_product_series: StringParameterBlockHydrated;

	constructor(obj: ContainerProductLoadProgramBlockSpec, ctx: PBRContext) {
		super(obj, ctx);
		this.container_name = ParameterBlockRegistry.String(obj.load_container[0]);
		this.container_product_series = ParameterBlockRegistry.String(obj.load_container[1]);
	}

	public async execute(): Promise<void> {
		const container_name = this.container_name.data;
		const container_product_series = this.container_product_series.data;

		this.ctx.logger.log("info", `ContainerLoadBlock: Will load ${container_name} with: ${container_product_series}.`);
		await this.ctx.containers.load(container_name, container_product_series);

		super.execute();
	}

	static is_containter_product_load_pg_b(obj: AllProgramBlocks): obj is ContainerProductLoadProgramBlockSpec {
		return (obj as ContainerProductLoadProgramBlockSpec).load_container !== undefined;
	}
}
