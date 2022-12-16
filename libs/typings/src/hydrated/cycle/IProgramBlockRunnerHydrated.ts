import { IProgramBlockRunner } from "../../spec/cycle/IProgramBlockRunner";
import { IProfileHydrated } from "../profile";
import { IAdditionalInfoHydrated } from "./IAddtionalInfoHydrated";
import { IPBRStartConditionHydrated } from "./IPBRStartConditionHydrated";
import { IProgramStepHydrated } from "./IProgramStepHydrated";
import { Modify } from "../../utils/Modify";

export type IProgramBlockRunnerHydrated = Modify<IProgramBlockRunner, {

    status: IPBRStatus;

    timers: Array<IProgramTimer & {timer?: NodeJS.Timer}>;
    variables: Array<IProgramVariable>;

    currentStepIndex: number;

    startConditions: IPBRStartConditionHydrated[],
    steps: IProgramStepHydrated[],
    profile?: IProfileHydrated,

    additionalInfo?: IAdditionalInfoHydrated[]

    get currentRunningStep(): IProgramStepHydrated

    profileExplorer?: (name: string) => number | boolean;

    dispose(): Promise<void>
    end(reason: string): void
}>;

export type EPBRMode = "created" | "started" | "ending" | "ended";

export interface IProgramVariable
{
    name: string;
    value: number;
}

export interface IProgramTimer
{
    name: string;
    enabled: boolean;
}

export interface IPBRStatus
{
    mode: EPBRMode,

    estimatedRunTime?: number,
    
    startDate?: number,
    endDate?: number,
    endReason?: string,

    progress?: number
}