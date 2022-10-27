import { IAdditionalInfo } from "./IAdditionalInfo";
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

    additionalInfo?: IAdditionalInfo[];
}

export interface IProgramRunner extends IProgram
{
    status: IPBRStatus;

    timers?: IProgramTimer[];
    variables?: IProgramVariable[];

    currentStepIndex?: number;
}

export type EPBRMode = "created" | "started" | "ending" | "ended";

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
}