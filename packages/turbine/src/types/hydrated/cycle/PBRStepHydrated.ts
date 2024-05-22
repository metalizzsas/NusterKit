import type { PBRStep, PBRStepState, PBRStepType } from "../../spec/cycle/PBRStep";
import type { Modify } from "../../utils";
import type { PBRStartConditionHydrated } from "./PBRStartConditionHydrated";
import type { NumericParameterBlockHydrated } from "./blocks/ParameterBlockHydrated";
import type { ProgramBlockHydrated } from "./blocks/ProgramBlockHydrated";

export type PBRStepHydrated = Modify<PBRStep, {
    
    startTime?: number;
    endTime?: number;

    endReason?: string;

    runCount?: number;
    
    isEnabled: NumericParameterBlockHydrated,

    runAmount?: NumericParameterBlockHydrated,

    runConditions: PBRStartConditionHydrated[],

    startBlocks: ProgramBlockHydrated[],
    blocks: ProgramBlockHydrated[],
    endBlocks: ProgramBlockHydrated[],

    state: PBRStepState;
    type: PBRStepType;

    progress: number

}>;