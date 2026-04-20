import type { NumericParameterBlockHydrated, StringParameterBlockHydrated } from "$types/hydrated/cycle/blocks/ParameterBlockHydrated";
import type { AllParameterBlocks, MaintenanceStatusParameterBlock as MaintenanceStatusParameterBlockSpec } from "$types/spec/cycle/parameter";
import type { PBRContext } from "../../../services/PBRContext";
import { ParameterBlockRegistry } from "../ParameterBlockRegistry";
import type { MaintenanceHydrated } from "$types/hydrated/maintenance";
import { StatusParameterBlock } from "../StatusParameterBlock";

export class MaintenanceStatusParameterBlock extends StatusParameterBlock {
	private taskName: StringParameterBlockHydrated;
	private optional: NumericParameterBlockHydrated;
	private ctx: PBRContext;

	#maintenanceTask?: MaintenanceHydrated;

	constructor(obj: MaintenanceStatusParameterBlockSpec, ctx: PBRContext) {
		super(obj);
		this.ctx = ctx;

		if (obj.maintenance_status instanceof Array) {
			this.taskName = ParameterBlockRegistry.String(obj.maintenance_status[0]);
			this.optional = ParameterBlockRegistry.Numeric(obj.maintenance_status[1]);
		} else {
			this.taskName = ParameterBlockRegistry.String(obj.maintenance_status);
			this.optional = ParameterBlockRegistry.Numeric(0);
		}

		this.ctx.maintenance.on(`updated.${this.taskName.data}`, (maintenance) => {
			this.#maintenanceTask = maintenance;
			this.subscriber?.(this.data);
		});

		const task = this.ctx.maintenance.read(this.taskName.data);
		if (task) {
			this.#maintenanceTask = task;
			this.subscriber?.(this.data);
		}
	}

	public get data(): "error" | "warning" | "good" {
		if (this.#maintenanceTask === undefined)
			return "error";

		if (this.#maintenanceTask.durationProgress === -1)
			return "warning";

		if (this.#maintenanceTask.durationProgress < 0.75)
			return "good";

		if (this.#maintenanceTask.durationProgress > 1)
			return (this.optional.data === 1) ? "warning" : "error";

		return "warning";
	}

	static isMaintenanceStatusPB(obj: AllParameterBlocks): obj is MaintenanceStatusParameterBlockSpec {
		return (obj as MaintenanceStatusParameterBlockSpec).maintenance_status !== undefined;
	}
}
