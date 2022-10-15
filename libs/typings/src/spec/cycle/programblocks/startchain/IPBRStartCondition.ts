import { IPBRSCCheckChain } from "./IPBRSCCheckChain";

export type EPBRStartConditionResult = "good" | "warning" | "error";

export interface IPBRStartCondition
{
    conditionName: string;
    startOnly: boolean;
    checkChain: IPBRSCCheckChain;
}