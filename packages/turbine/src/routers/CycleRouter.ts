import type { CyclePremade, ProgramBlockRunner as ProgramBlockRunnerConfig } from "../types/spec/cycle";
import { ProgramBlockRunner } from "../pbr/ProgramBlockRunner";
import type { ProgramBlockRunnerHydrated } from "../types/hydrated/cycle/ProgramBlockRunnerHydrated";
import type { ServiceRegistry } from "../services/interfaces";

export class CycleRouter {
    private supportedCycles: { name: string, profileRequired: boolean }[] = [];
    private premadeCycles: CyclePremade[] = [];
    private cycleTypes: ProgramBlockRunnerConfig[];
    public serviceRegistry?: ServiceRegistry;

    public program?: ProgramBlockRunner;

    constructor(cycleTypes: ProgramBlockRunnerConfig[], cyclePremades: CyclePremade[]) {
        this.cycleTypes = cycleTypes;

        this.supportedCycles = this.cycleTypes.map((c) => { return { name: c.name, profileRequired: c.profileRequired }});
        this.premadeCycles = cyclePremades;
    }

    public get socketData(): ProgramBlockRunnerHydrated | undefined {
        return this.program as unknown as ProgramBlockRunnerHydrated;
    }
}