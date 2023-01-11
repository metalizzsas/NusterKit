import type { PBRStartCondition, PBRStartConditionResult } from "../../spec/cycle/PBRStartCondition";
import type { Modify } from "../../utils/Modify";
import type { NumericParameterBlockHydrated, StatusParameterBlockHydrated } from "./blocks/ParameterBlockHydrated";

export type PBRStartConditionHydrated = Modify<PBRStartCondition, {
    disabled?: NumericParameterBlockHydrated;
    checkchain: () => StatusParameterBlockHydrated["data"]
    result: PBRStartConditionResult;
}>;