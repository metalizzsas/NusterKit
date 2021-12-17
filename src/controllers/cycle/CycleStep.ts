export interface ICycleStep
{
    name: string,
    status: ICycleStepInformations
}


export interface ICycleStepInformations
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

/**
 * CycleStepState 
 */
export enum CycleStepState
{
    WAITING = "waiting",
    STARTED = "started",
    PARTIAL = "partial",
    STOPPED = "stopped",
    ENDED = "ended",
    DISABLED = "disabled"
}

export enum CycleStepType
{
    SINGLE = "single",
    MULTIPLE = "multiple"
}

export enum CycleStepResult
{
    FAILED = "failed",
    PARTIAL = "partial",
    END = "end"
}