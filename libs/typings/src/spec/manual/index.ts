import { IMachineSpecs } from "..";

export interface IConfigManualMode
{
    /** Name of the manual mode can contain 1 `#` for categorizing */
    name: string,

    /** Unity of this manual mode, will fetch the first gate unity, else, will be % */
    unity?: string;

    /** Manual mode controls */
    controls: (IManualControl | string)[],
    /** Incompatibilities between manual modes */
    incompatibility?: string[],
    /** Manual modes required to be enabled */
    requires?: string[],
    /** Watchdog Security chain */
    watchdog?: IManualSecurityCondition[]

    /** Manual mode analog scale */
    analogScale?: {
        min: number;
        max: number;
    }
}

/** Extended manual control definiton */
export interface IManualControl {
    /** IO Gate name */
    name: IMachineSpecs["iogates"][number]["name"];
    /** Does this gate depends on the analog scale */
    analogScaleDependant: boolean;
    /** IS value of the gate is absolute from manual value  */
    isValueAbsolute?: boolean;
    /** Does this gate is triggered when the manual mode is negative */
    triggerWhenNegative?: boolean;
}

export interface IManualSecurityCondition
{
    /** Gate name to control */
    gateName: IMachineSpecs["iogates"][number]["name"];
    /** Gate value required for the security */
    gateValue: number;
}