import { IIOGate, IOGateTypes } from "./gates/IIOGate";
import { IIOHandler } from "./IIOHandler";
import { IConfigMaintenance } from "./IMaintenance";
import { IManualMode } from "./IManualMode";
import { IPassive } from "./IPassive";
import { IConfigProfile, IProfileSkeleton } from "./IProfile";
import { IPBRPremades, IProgram } from "./IProgramBlockRunner";
import { IConfigSlot } from "./ISlot";

/** Machine JSON Specifications */
export declare interface IMachine
{
    /** Cycle types definition */
    cycleTypes: IProgram[],
    /** Cycle premades definition */
    cyclePremades: IPBRPremades[],

    /** IOHandler definitions */
    iohandlers: IIOHandler[],
    /** IOGates definition */
    iogates: IOGateTypes[],

    /** Maintenance tasks definition */
    maintenance: IConfigMaintenance[],
    /** Manuals modes definition */
    manual: IManualMode[],

    /** Passive modes definition */
    passives: IPassive[],
    /** Profile skeletons definition */
    profileSkeletons: IProfileSkeleton[],
    /** Premade profile definition */
    profilePremades: IConfigProfile[],

    /** Product slots definition */
    slots: IConfigSlot[]
}

/** IMachine Configuration keys */
export type IMachineKeys = keyof IMachine;
/** IMachine Configuration Children Types */
export type IMachineElements = IProgram[] | IPBRPremades[] | IIOHandler[] | IIOGate[] | IConfigMaintenance[] | IManualMode[] | IPassive[] | IProfileSkeleton[] | IConfigProfile[] | IConfigSlot[];

/** Machine additional settings */
export declare interface IMachineSettings
{
    /** Masked premade cycles */
    maskedPremades: string[];
    /** Masked premade profiles */
    maskedProfiles: string[];
    /** Masked manual modes */
    maskedManuals: string[];
    /** Disable IO controls access */
    ioControlsMasked: boolean;
}

/** Configuration info.json driving NusterTurbine */
export interface IConfiguration
{
    /** Machine Name */
    name: string;
    /** Machine Serial number */
    serial: string;

    /** Machine model */
    model: string;
    /** Machine variant */
    variant: string;
    /** Machine revision */
    revision: number;

    /** Machine Addons */
    addons?: string[];
    
    /** Machine options */
    options: IMachine;
    /** Machine Settings */
    settings?: IMachineSettings;
}