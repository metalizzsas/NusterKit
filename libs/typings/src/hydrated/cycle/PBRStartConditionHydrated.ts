import type { PBRRunCondition, PBRStartConditionResult } from "../../spec/cycle/PBRRunCondition";
import type { Modify } from "../../utils/Modify";
import type { NumericParameterBlockHydrated, StatusParameterBlockHydrated } from "./blocks/ParameterBlockHydrated";

export type PBRStartConditionHydrated = Modify<PBRRunCondition, {
    disabled?: NumericParameterBlockHydrated;
    checkchain: () => StatusParameterBlockHydrated["data"]
    result: PBRStartConditionResult;
}>;