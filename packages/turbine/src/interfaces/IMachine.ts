import { IOGatesConfig } from "./gates/IIOGate";
import { IOControllersConfig } from "./IIOControllers";
import { IConfigMaintenance } from "./IMaintenance";
import { IManualMode } from "./IManualMode";
import { IPassive } from "./IPassive";
import { IConfigProfile, IProfileSkeleton } from "./IProfile";
import { IPBRPremades, IProgram } from "./IProgramBlockRunner";
import { IConfigSlot } from "./ISlot";
import { INusterPopup } from "./nusterData/INusterPopup";

/** Machine JSON Specifications */
export declare interface IMachine
{
    /** Nuster Additional data */
    nuster?: {
        /** Connect popup is triggered when the user logs on for the first time */
        connectPopup?: INusterPopup
    }

    /** Cycle types definition */
    cycleTypes: IProgram[],
    /** Cycle premades definition */
    cyclePremades: IPBRPremades[],

    /** IOHandler definitions */
    iohandlers: IOControllersConfig[],
    /** IOGates definition */
    iogates: IOGatesConfig[],

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

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 17, 18, 19, 20, ...0[]]

type Join<K, P> = K extends string | number ?
    P extends string | number ?
    `${K}${"" extends P ? "" : "."}${P}`
    : never : never;

type Paths<T, D extends number = 10> = [D] extends [never] ? never : T extends object ?
    { [K in keyof T]-?: K extends string | number ?
        `${K}` | Join<K, Paths<T[K], Prev[D]>>
        : never
    }[keyof T] : ""

export type IMachinePaths = Paths<IMachine>