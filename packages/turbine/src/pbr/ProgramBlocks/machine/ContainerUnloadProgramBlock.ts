import type { StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllProgramBlocks, ContainerProductUnloadProgramBlock as ContainerProductUnloadProgramBlockSpec } from "$types/spec/cycle/program";
import type { PBRContext } from "../../../services/PBRContext";
import { ParameterBlockRegistry } from "../../ParameterBlocks/ParameterBlockRegistry";
import { ProgramBlock } from "../ProgramBlock";

export class ContainerProductUnloadProgramBlock extends ProgramBlock {
	containterName: StringParameterBlockHydrated;

	constructor(obj: ContainerProductUnloadProgramBlockSpec, ctx: PBRContext) {
		super(obj, ctx);
		this.containterName = ParameterBlockRegistry.String(obj.unload_container);
	}

	public async execute(): Promise<void> {
		const containerName = this.containterName.data;

		this.ctx.logger.log("info", `SlotUnloadBlock: Will unload slot with name: ${containerName}.`);
		await this.ctx.containers.unload(containerName);

		super.execute();
	}

	static isContainerProductUnloadPgB(obj: AllProgramBlocks): obj is ContainerProductUnloadProgramBlockSpec {
		return (obj as ContainerProductUnloadProgramBlockSpec).unload_container !== undefined;
	}
}
