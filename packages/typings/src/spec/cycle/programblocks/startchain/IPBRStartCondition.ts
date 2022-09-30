import { IPBRSCCheckChain } from "./IPBRSCCheckChain";

export enum EPBRStartConditionResult
{
    GOOD = "good", //the condition is met we can start
    WARNING = "warning", //the condition is not met but we can start
    ERROR = "error", //the condition is not met and we can't start
}

export interface IPBRStartCondition
{
    conditionName: string;
    startOnly: boolean;
    checkChain: IPBRSCCheckChain;
}