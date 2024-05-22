import type { Addon } from "../spec/addons";

export type ConfigModel = "metalfog" | "smoothit" | "uscleaner";
export type ConfigVariant = "m";

/** Configuration info.json driving NusterTurbine */
export declare interface Configuration
{
    /** JSON Schema for json validation */
    $schema: string;

    /** Machine Name */
    name: string;
    /** Machine Serial number */
    serial: string;

    /** Machine model */
    model: string;

    /** Machine Addons */
    addons: string[];
    
    /** Machine Specific addon, should be used as less as possible */
    machineAddons: Addon[];

    /** Machine Settings */
    settings: Settings;
}

/** Machine additional settings */
export interface Settings
{
    /**
     * Dev mode enabled on this machine.
     * 
     * Enables:
     *  - NextStep button on cycle
     *  - IO Controls
     *  - profilesShown is overriden to `true`.
     * @defaultValue false
     */
    devMode: boolean;

    /**
     * Do profiles list is shown
     * @defaultValue true
     */
    profilesShown: boolean;

    /**
     * Only show picked profile fields
     * @defaultValue false
     */
    onlyShowSelectedProfileFields: boolean;

    /**
     * Hides multilayer indications in cycle
     * @defaultValue false
     */
    hideMultilayerIndications: boolean;

    /**
     * Additional variables.
     * Can be retreived by a `ParameterBlock` in `ProgramBlockRunner`.
     * @defaultValue []
     */
    variables: Array<{
        name: string;
        value: number;
    }>;
}