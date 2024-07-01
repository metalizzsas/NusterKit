import type { PBRStep, PBRStepState, PBRStepType } from "../../spec/cycle/PBRStep";
import type { Modify } from "../../utils";
import type { PBRStartConditionHydrated } from "./PBRStartConditionHydrated";

export type PBRStepHydrated = Omit<Modify<PBRStep, {
   
    type: PBRStepType;
    state: PBRStepState;
    
    isEnabled: boolean,
    runAmount: number,
    runCount: number;

    runConditions: PBRStartConditionHydrated[],
    
    duration: number | null;
    progress: number | null;
    progresses: Array<number | null>;

    startTime?: number;
    endTime?: number;
    endReason?: string;
}>, "startBlocks" | "endBlocks" | "blocks" | "runConditions">;