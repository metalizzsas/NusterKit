import { EPBRStartConditionResult, IPBRStartCondition } from "../../spec/cycle/security/IPBRStartCondition";
import { Modify } from "../../utils/Modify";
import { NumericParameterBlockHydrated, StatusParameterBlockHydrated } from "./blocks/ParameterBlockHydrated";

export type IPBRStartConditionHydrated = Modify<IPBRStartCondition, {
    disabled?: NumericParameterBlockHydrated;
    checkchain: () => StatusParameterBlockHydrated["data"]
    result: EPBRStartConditionResult;
}>;