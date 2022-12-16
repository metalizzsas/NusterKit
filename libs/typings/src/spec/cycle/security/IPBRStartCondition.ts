import { NumericParameterBlocks, StatusParameterBlocks } from "../IParameterBlocks";

export type EPBRStartConditionResult = "good" | "warning" | "error" | "disabled";

export interface IPBRStartCondition
{
    conditionName: string;
    startOnly: boolean;
    checkchain: {
        io?: { gateName: string, gateValue: number },
        parameter?: StatusParameterBlocks
    }
    disabled?: NumericParameterBlocks;
}