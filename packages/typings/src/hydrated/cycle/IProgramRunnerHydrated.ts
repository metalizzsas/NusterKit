import { IProgramRunner } from "../../spec/cycle/IProgramBlockRunner";
import { IProfileMappedHydrated } from "../profile";
import { IPBRStartConditionHydrated } from "./IPBRStartConditionHydrated";
import { IProgramStepHydrated } from "./IProgramStepHydrated";

export type IProgramBlockRunnerHydrated = Omit<IProgramRunner, "startConditions" | "steps"> & {
    startConditions: IPBRStartConditionHydrated[],
    steps: IProgramStepHydrated[],
    profile?: IProfileMappedHydrated,
}