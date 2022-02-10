import { ParameterBlock } from "../programblocks/ParameterBlocks";
import { IParameterBlock } from "./IParameterBlock";
import { IProgramBlock } from "./IProgramBlock";

export interface IProgramStep
{
    name: string;

    state: ProgramStepState;
    type: ProgramStepType;
    
    isEnabled: IParameterBlock;
    duration: IParameterBlock;

    startTime?: number;
    endTime?: number;

    runAmount?: IParameterBlock;
    runCount?: number;

    startBlocks: IProgramBlock[];
    endBlocks: IProgramBlock[];

    blocks: IProgramBlock[]
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

export interface IProgramStepIOStarter
{
    name: ParameterBlock;
    value: ParameterBlock;
}

export enum ProgramStepState
{
    WAITING = "waiting",
    STARTED = "started",
    PARTIAL = "partial",
    STOPPED = "stopped",
    COMPLETED = "completed",
    DISABLED = "disabled",
    SKIPPED = "skipped"
}

export enum ProgramStepType
{
    SINGLE = "single",
    MULTIPLE = "multiple"
}

export enum ProgramStepResult
{
    FAILED = "failed",
    PARTIAL = "partial",
    END = "end"
}