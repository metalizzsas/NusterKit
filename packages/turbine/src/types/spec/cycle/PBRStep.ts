import type { PBRRunCondition } from "./PBRRunCondition";
import type { NumericParameterBlocks } from "./parameter";
import type { AllProgramBlocks } from "./program";

export interface PBRStep
{
    /** Program Step name */
    name: string;
    
    /** Parameter block that indicates if this step is enabled in the PBR flow */
    isEnabled: NumericParameterBlocks;

    /** Optional Parameter block that tells the PBR if this steps must be runt multiple times */
    runAmount?: NumericParameterBlocks;

    /** Step run conditions, theeses runConditions triggers Soft End Strategy if defined, otherwise, runs hard end strategy */
    runConditions?: Array<PBRRunCondition>;

    /** Partial end step fallback */
    partialStepFallback?: number;

    /** Step to goto on soft end */
    crashStepFallback?: number;
    
    /** Program Blocks array that are executed at the start of a step */
    startBlocks: Array<AllProgramBlocks>;
    /** Program Blocks array that are executed at the end of a step */
    endBlocks: Array<AllProgramBlocks>;
    /** Program blocks Array that is executed by this step */
    blocks: Array<AllProgramBlocks>;
}

export interface PBRStepInformations
{
    isEnabled: boolean,

    type?: string,
    state?: string,

    duration?: number,
    startTime?: number,
    endTime?: number,

    runAmount?: number,
    runCount?: number
}

/** Step state */
export type PBRStepState = "created" | "started" | "disabled" | "partial" | "skipped" | "ending" | "ended" | "crashed";

/** Step Type Programaticaly given by the RunAmount parameter of a step */
export type PBRStepType = "single" | "multiple";

/** Result from a step execution */
export type PBRStepResult = "next" | number;