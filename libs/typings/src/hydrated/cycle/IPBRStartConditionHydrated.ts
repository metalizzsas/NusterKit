import { IPBRStartCondition } from "../../spec/cycle/programblocks/startchain/IPBRStartCondition";

export type IPBRStartConditionHydrated = IPBRStartCondition & {
    result: "error" | "warning" | "good" | "disabled";
}