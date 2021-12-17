import { Machine } from "../../Machine";
import { ProgramBlockRunner } from "../../programblocks/ProgramBlockRunner";
import { IOExplorer } from "../io/IOExplorer";
import { IProfile } from "../profile/Profile";
import { ProfileExplorer } from "../profile/ProfileExplorer";
import { ICycleStep } from "./CycleStep";

export interface ICycle
{
    machine: Machine;
    name: string;

    profileExplorer?: ProfileExplorer;
    ioExplorer?: IOExplorer;

    currentStepIndex: number;

    program: ProgramBlockRunner

    status: ICycleStatus,
    profile?: IProfile,
    steps: ICycleStep[]

    run(): Promise<boolean>
    end(reason?: string): void
    stop(): void
    progress(): number
    toJSON(): Record<string, unknown>
}

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