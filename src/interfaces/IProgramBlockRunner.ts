import { IProgramBlock } from "./IProgramBlock";
import { IProgramStep } from "./IProgramStep";
import { IPBRStartCondition } from "./programblocks/startchain/IPBRStartCondition";

export interface IPBRPremades
{
    name: string;
    profile: string;
    cycle: string;
}

export interface IPBRStatus
{
    mode: EPBRMode,

    estimatedRunTime?: number,
    
    startDate?: number,
    endDate?: number,
    endReason?: string,

    progress?: number
}

export interface IProgram
{
    name: string;
    profileRequired: boolean;

    startConditions: IPBRStartCondition[];

    steps: IProgramStep[];
}

export interface IProgramRunner extends IProgram
{
    status: IPBRStatus;

    timers?: IProgramTimer[];
    variables?: IProgramVariable[];

    currentStepIndex?: number;
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