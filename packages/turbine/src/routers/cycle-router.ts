import type { ProgramBlockRunner } from "../pbr/program-block-runner";
import type { ServiceRegistry } from "../services/interfaces";
import type { ProgramBlockRunnerHydrated } from "../types/hydrated/cycle/program-block-runner-hydrated";
import type { CyclePremade, ProgramBlockRunner as ProgramBlockRunnerConfig } from "../types/spec/cycle";

export class CycleRouter {
	private supported_cycles: { name: string; profileRequired: boolean }[] = [];
	private premade_cycles: CyclePremade[] = [];
	private cycleTypes: ProgramBlockRunnerConfig[];
	public service_registry?: ServiceRegistry;

	public program?: ProgramBlockRunner;

	constructor(cycleTypes: ProgramBlockRunnerConfig[], cyclePremades: CyclePremade[]) {
		this.cycleTypes = cycleTypes;

		this.supported_cycles = this.cycleTypes.map((c) => {
			return { name: c.name, profileRequired: c.profileRequired };
		});
		this.premade_cycles = cyclePremades;
	}

	public get socket_data(): ProgramBlockRunnerHydrated | undefined {
		return this.program as unknown as ProgramBlockRunnerHydrated;
	}
}
