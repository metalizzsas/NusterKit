import type { ProgramBlockRunner } from "../../spec/cycle";
import type { Modify } from "../../utils";
import type { ProfileHydrated } from "../profiles";
import type { PBRStartConditionHydrated } from "./PBRStartConditionHydrated";
import type { PBRStepHydrated } from "./PBRStepHydrated";

export type ProgramBlockRunnerHydrated = Modify<ProgramBlockRunner, {
    
    status: PBRStatus;

    timers: Array<PBRTimer & { timer?: NodeJS.Timer }>;
    variables: Array<PBRVariable>;

    currentStepIndex: number;

    runConditions: Array<PBRStartConditionHydrated>,
    steps: Array<PBRStepHydrated>;
    profile?: ProfileHydrated,

    additionalInfo?: Array<string>;

    events: Array<{ data: string, time: number}>;

    get currentRunningStep(): PBRStepHydrated

    dispose(): void
    end(reason: string): void
}>;

export type PBRMode = "creating" | "created" | "started" | "paused" | "ending" | "ended";

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

export type PBRStatus = {
    
    mode: PBRMode;

    estimatedRunTime?: number;
    overallPausedTime?: number;
    pausable: boolean;
    
    startDate?: number;
    endDate?: number;
    endReason?: string;

    progress?: number;
}