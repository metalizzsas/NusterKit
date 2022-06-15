import { IProgramBlock } from "./IProgramBlock";
import { IProgramStep } from "./IProgramStep";
import { IPBRStartCondition } from "./programblocks/startchain/IPBRStartCondition";

export interface IPBRStatus
{
    mode: EPBRMode,
    
    startDate?: number,
    endDate?: number,
    endReason?: string,

    progress?: number
}

export interface IProgram
{
    name: string;

    profileRequired: boolean;

    currentStepIndex?: number;

    variables?: IProgramVariable[];
    timers?: IProgramTimer[];
    status?: IPBRStatus;
    
    steps: IProgramStep[];

    startConditions: IPBRStartCondition[];
}

export enum EPBRMode
{
    CREATED = "created",
    STARTED = "started",
    PAUSED = "paused",
    WAITING_PAUSE = "waiting-for-pause",
    STOPPED = "stopped",
    WAITING_STOP = "waiting-for-stop",
    ENDED = "ended"
}

export interface IProgramVariable
{
    name: string;
    value: number;
}

export interface IProgramTimer
{
    name: string;
    enabled: boolean;
    blocks: IProgramBlock[];
    timer?: NodeJS.Timer;
}