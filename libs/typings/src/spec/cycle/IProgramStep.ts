import { NumericParameterBlocks } from "./IParameterBlocks";
import { AllProgramBlocks } from "./IProgramBlocks";

export interface IProgramStep
{
    /** Program Step name */
    name: string;
    
    /** Parameter block that indicates if this step is enabled in the PBR flow */
    isEnabled: NumericParameterBlocks;

    /** Optional Parameter block that tells the PBR if this steps must be runt multiple times */
    runAmount?: NumericParameterBlocks;
    
    /** Program Blocks array that are executed at the start of a step */
    startBlocks: Array<AllProgramBlocks>;
    /** Program Blocks array that are executed at the end of a step */
    endBlocks: Array<AllProgramBlocks>;
    /** Program blocks Array that is executed by this step */
    blocks: Array<AllProgramBlocks>;
}

export interface IProgramStepInformations
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
export type EProgramStepState = "created" | "started" | "partial" | "disabled" | "skipped" | "ending" | "ended";

/** Step Type Programaticaly given by the RunAmount parameter of a step */
export type EProgramStepType = "single" | "multiple";

/** Result from a step execution */
export type EProgramStepResult = "partial" | "ended";