import { INusterPopup } from "../configuration/nuster/INusterPopup"
import { IProgram, IPBRPremades } from "./cycle/IProgramBlockRunner"
import { IOGatesConfig } from "./iogates"
import { IOControllersConfig } from "./iophysicalcontrollers"
import { IConfigMaintenance } from "./maintenance"
import { IConfigManualMode } from "./manual"
import { IConfigPassive } from "./passive"
import { IProfileSkeleton, IConfigProfile } from "./profile"
import { IConfigSlot } from "./slot"

/** Machine JSON Specifications */
export declare interface IMachineSpecs
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
    manual: IConfigManualMode[],

    /** Passive modes definition */
    passives: IConfigPassive[],
    /** Profile skeletons definition */
    profileSkeletons: IProfileSkeleton[],
    /** Premade profile definition */
    profilePremades: IConfigProfile[],

    /** Product slots definition */
    slots: IConfigSlot[]
}