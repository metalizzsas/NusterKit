import { IProgramRunner } from "../../spec/cycle/IProgramBlockRunner";
import { IProfileHydrated } from "../profile";
import { IAdditionalInfoHydrated } from "./IAddtionalInfoHydrated";
import { IPBRStartConditionHydrated } from "./IPBRStartConditionHydrated";
import { IProgramStepHydrated } from "./IProgramStepHydrated";

export type IProgramBlockRunnerHydrated = Omit<IProgramRunner, "startConditions" | "steps"> & {
    startConditions: IPBRStartConditionHydrated[],
    steps: IProgramStepHydrated[],
    profile?: IProfileHydrated,

    additionalInfo?: IAdditionalInfoHydrated[]
}