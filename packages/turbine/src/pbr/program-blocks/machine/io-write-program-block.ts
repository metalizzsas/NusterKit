import type { NumericParameterBlockHydrated, StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/parameter-block-hydrated";
import type { AllProgramBlocks, IOWriteProgramBlock as IOWriteProgramBlockSpec } from "$types/spec/cycle/program";
import type { PBRContext } from "../../../services/pbr-context";
import { ParameterBlockRegistry } from "../../parameter-blocks/parameter-block-registry";
import { ProgramBlock } from "../program-block";

export class IOWriteProgramBlock extends ProgramBlock {
	gateName: StringParameterBlockHydrated;
	gateValue: NumericParameterBlockHydrated;

	estimatedRunTime = 0.01;

	constructor(obj: IOWriteProgramBlockSpec, ctx: PBRContext) {
		super(obj, ctx);
		this.gateName = ParameterBlockRegistry.String(obj.io_write[0]);
		this.gateValue = ParameterBlockRegistry.Numeric(obj.io_write[1]);
	}

	public async execute(signal?: AbortSignal): Promise<void> {
		const gateName = this.gateName.data;
		const gateValue = this.gateValue.data;

		this.ctx.logger.log("info", `IOWriteBlock: Will access ${gateName} to write ${gateValue}.`);

		try {
			await this.ctx.io.write(gateName, gateValue);
		} catch (err) {
			this.ctx.logger.log("warning", `IOWriteBlock: ${gateName} write failed: ${(err as Error).message}`);
			this.ctx.stop("controllerError");
		}

		super.execute();
	}

	static isIOWritePgB(obj: AllProgramBlocks): obj is IOWriteProgramBlockSpec {
		return (obj as IOWriteProgramBlockSpec).io_write !== undefined;
	}
}
