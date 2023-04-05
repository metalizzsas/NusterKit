import type { NumericParameterBlocks, StatusParameterBlocks } from "./blocks/ParameterBlocks";

type PBRStartConditionResult = "good" | "warning" | "error" | "disabled";

type PBRRunCondition = {

    /** Name of the run condition, used for reference */
    name: string;
    /** Is the condition only used at start */
    startOnly: boolean;
    /** Checkchain used to validate status */
    checkchain: {
        io?: { gateName: string, gateValue: number },
        parameter?: StatusParameterBlocks
    }
    /** Parameter that disables this runCondition */
    disabled?: NumericParameterBlocks;
}

export { PBRRunCondition , PBRStartConditionResult };