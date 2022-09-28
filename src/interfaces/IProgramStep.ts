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
export enum EProgramStepState
{
    /** Created but not executed yet */
    CREATED = "created",
    /** Currently being executed */
    STARTED = "started",
    /** Partialy ended, this steps will be executed again */
    PARTIAL = "partial",

    /** Step is disabled */
    DISABLED = "disabled",
    /** Step was skipped */
    SKIPPED = "skipped",

    /** Step is being ended by force */
    ENDING = "ending",
    /** Step has ended */
    ENDED = "ended",
}

/** Step Type Programaticaly given by the RunAmount parameter of a step */
export enum EProgramStepType
{
    SINGLE = "single",
    MULTIPLE = "multiple"
}

/** Result from a step execution */
export enum EProgramStepResult
{
    /** Step is partialy ended, it wil be re-executed another time */
    PARTIAL_END = "partial",
    /** Step has ended */
    ENDED = "ended"
}