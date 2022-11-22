import { INumericParameterBlock } from "../../IParameterBlock";
import { IPBRSCCheckChain } from "./IPBRSCCheckChain";

export type EPBRStartConditionResult = "good" | "warning" | "error" | "disabled";

export interface IPBRStartCondition
{
    conditionName: string;
    startOnly: boolean;
    checkChain: IPBRSCCheckChain;
    disabled?: INumericParameterBlock;
}