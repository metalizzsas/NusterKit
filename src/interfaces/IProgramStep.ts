import { INumericParameterBlock } from "./IParameterBlock";
import { IProgramBlocks } from "./IProgramBlock";

export interface IProgramStep
{
    name: string;
    
    //params
    isEnabled: INumericParameterBlock;
    duration: INumericParameterBlock;

    runAmount?: INumericParameterBlock;
    
    //blocks
    startBlocks: IProgramBlocks[];
    endBlocks: IProgramBlocks[];

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

export enum EProgramStepState
{
    WAITING = "waiting",
    STARTED = "started",
    PARTIAL = "partial",
    STOPPED = "stopped",
    COMPLETED = "completed",
    DISABLED = "disabled",
    SKIPPED = "skipped"
}

export enum EProgramStepType
{
    SINGLE = "single",
    MULTIPLE = "multiple"
}

export enum EProgramStepResult
{
    FAILED = "failed",
    PARTIAL = "partial",
    END = "end"
}