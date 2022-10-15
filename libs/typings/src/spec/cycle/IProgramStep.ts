import { INumericParameterBlock } from "./IParameterBlock";
import { IProgramBlocks } from "./IProgramBlock";

export interface IProgramStep
{
    /** Program Step name */
    name: string;
    
    /** Parameter block that indicates if this step is enabled in the PBR flow */
    isEnabled: INumericParameterBlock;

    /** Parameter block that indicates the estimated Step duration time*/
    duration: INumericParameterBlock;

    /** Optional Parameter block that tells the PBR if this steps must be runt multiple times */
    runAmount?: INumericParameterBlock;
    
    /** Program Blocks array that are executed at the start of a step */
    startBlocks: IProgramBlocks[];
    /** Program Blocks array that are executed at the end of a step */
    endBlocks: IProgramBlocks[];
    /** Program blocks Array that is executed by this step */
    blocks: IProgramBlocks[]
}

export interface IProgramStepRunner extends IProgramStep
{
    startTime?: number;
    endTime?: number;

    runCount?: number;

    state?: EProgramStepState;
    type?: EProgramStepType;
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