import type { NumericParameterBlocks, StatusParameterBlocks } from "./blocks/ParameterBlocks";

type PBRStartConditionResult = "good" | "warning" | "error" | "disabled";

interface PBRStartCondition
{
    conditionName: string;
    startOnly: boolean;
    checkchain: {
        io?: { gateName: string, gateValue: number },
        parameter?: StatusParameterBlocks
    }
    disabled?: NumericParameterBlocks;
}

export { PBRStartCondition, PBRStartConditionResult };