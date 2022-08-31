import { IIOGate } from "./gates/IIOGate";
import { IIOHandler } from "./IIOHandler";
import { IConfigMaintenance } from "./IMaintenance";
import { IManualMode } from "./IManualMode";
import { IPassive } from "./IPassive";
import { IConfigProfile, IProfileSkeleton } from "./IProfile";
import { IPBRPremades, IProgram } from "./IProgramBlockRunner";
import { IConfigSlot } from "./ISlot";

//machine json interface
export declare interface IMachine
{
    cycleTypes: IProgram[],
    cyclePremades: IPBRPremades[],

    iohandlers: IIOHandler[],
    iogates: IIOGate[],

    maintenance: IConfigMaintenance[],
    manual: IManualMode[],

    passives: IPassive[],
    profileSkeletons: IProfileSkeleton[],
    profilePremades: IConfigProfile[],

    slots: IConfigSlot[]
}
export type IMachineKeys = keyof IMachine;
export type IMachineElements = IProgram[] | IPBRPremades[] | IIOHandler[] | IIOGate[] | IConfigMaintenance[] | IManualMode[] | IPassive[] | IProfileSkeleton[] | IConfigProfile[] | IConfigSlot[];

export declare interface IMachineSettings
{
    maskedPremades: string[];
    maskedProfiles: string[];
    maskedManuals: string[];
    ioControlsMasked: boolean;
}

export interface IConfiguration
{
    name: string;
    serial: string;

    model: string;
    variant: string;
    revision: number;

    addons?: string[];

    options: IMachine;
    settings?: IMachineSettings;
}