import { IAddon } from "./addons"
import { IProgramBlockRunner, IPBRPremades } from "./cycle/IProgramBlockRunner"
import { IOGatesConfig } from "./iogates"
import { IOControllersConfig } from "./iophysicalcontrollers"
import { IConfigMaintenance } from "./maintenance"
import { IConfigManualMode } from "./manual"
import { IProfileConfig, IProfileSkeleton } from "./profile"
import { IConfigSlot } from "./slot"
import { IPopup } from "../hydrated"

/** Machine JSON Specifications */
export declare interface IMachineSpecs
{
    /** 
     * Schema used by the configuration file
     * @defaultValue ../../../../node_modules/@metalizzsas/nuster-typings/build/schemas/schema-specs.json
     */
    $schema: string;

    /** Nuster Additional data */
    nuster?: {
        /** Connect popup is triggered when the user logs on for the first time */
        connectPopup?: IPopup
    }

    /** Cycle types definition */
    cycleTypes: IProgramBlockRunner[],
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

    /** Profile skeletons definition */
    profileSkeletons: IProfileSkeleton[],
    /** Premade profile definition */
    profilePremades: IProfileConfig[],

    /** Product slots definition */
    slots: IConfigSlot[],

    /** 
     * Addons available on this machine
     * @beta
     */
    addons?: IAddon[]
}