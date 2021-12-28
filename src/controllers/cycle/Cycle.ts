
export interface ICycleStatus
{
    mode: CycleMode,
    
    startDate?: number,
    endDate?: number,
    endReason?: string,

    progress?: number
}

/**
 * This defines all the cycle modes
 */
export enum CycleMode
{
    CREATED = "created",
    STARTED = "started",
    PAUSED = "paused",
    WAITING_PAUSE = "waiting-for-pause",
    STOPPED = "stopped",
    WAITING_STOP = "waiting-for-stop",
    ENDED = "ended"
}