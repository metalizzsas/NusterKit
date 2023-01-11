import type { ProgramBlockRunner } from "../../spec/cycle";
import type { Modify } from "../../utils/Modify";
import type { ProfileHydrated } from "../profiles";
import type { PBRStartConditionHydrated } from "./PBRStartConditionHydrated";
import type { PBRStepHydrated } from "./PBRStepHydrated";

export type ProgramBlockRunnerHydrated = Modify<ProgramBlockRunner, {

    status: PBRStatus;

    timers: Array<PBRTimer & { timer?: NodeJS.Timer }>;
    variables: Array<PBRVariable>;

    currentStepIndex: number;

    startConditions: Array<PBRStartConditionHydrated>,
    steps: Array<PBRStepHydrated>;
    profile?: ProfileHydrated,

    additionalInfo?: Array<string>;

    get currentRunningStep(): PBRStepHydrated

    dispose(): void
    end(reason: string): void
}>;

export type PBRMode = "creating" | "created" | "started" | "ending" | "ended";

export interface PBRVariable
{
    name: string;
    value: number;
}

export interface PBRTimer
{
    name: string;
    enabled: boolean;
}

export interface PBRStatus
{
    mode: PBRMode,

    estimatedRunTime?: number,
    
    startDate?: number,
    endDate?: number,
    endReason?: string,

    progress?: number
}