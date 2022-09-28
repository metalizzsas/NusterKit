import { IAddon } from "./IAddon";

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
    
    /** Machine Specific addon, should be used as less as possible */
    machineAddons?: IAddon[];

    /** Machine Settings */
    settings?: IMachineSettings;
}

/** Machine additional settings */
export declare interface IMachineSettings
{
    /** Masked premade cycles */
    maskedPremades?: string[];
    /** Masked premade profiles */
    maskedProfiles?: string[];
    /** Masked manual modes */
    maskedManuals?: string[];
    
    /** 
     * Disable IO controls access 
     * @defaultValue true
     */
    ioControlsMasked?: false;

    /**
     * Enable prototype mode
     * @defaultValue false
     */
    isPrototype?: true;
}