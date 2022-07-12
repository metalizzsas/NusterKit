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
    iohandlers: IIOHandler[],
    iogates: IIOGate[],
    slots: IConfigSlot[],
    profiles: {
        skeletons: IProfileSkeleton[],
        premades: IConfigProfile[]
    },
    maintenance: IConfigMaintenance[],
    passives: IPassive[],
    manual: IManualMode[],
    cycles: {
        types: IProgram[],
        premades: IPBRPremades[]
    }
}

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
    options: IMachine;
    settings?: IMachineSettings;
}