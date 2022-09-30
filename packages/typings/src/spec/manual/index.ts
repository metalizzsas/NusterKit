export interface IConfigManualMode
{
    /** Name of the manual mode can contain 1 `#` for categorizing */
    name: string,

    controls: ({
        name: string;
        analogScaleDependant: boolean;
    } | string)[],
    
    /** Incompatibilities between manual modes */
    incompatibility?: string[],
    /** Manual modes required to be enabled */
    requires?: string[],
    /** Watchdog Security chain */
    watchdog?: IManualWatchdogCondition[]

    /** Manual mode analog scale */
    analogScale?: {
        min: number;
        max: number;
    }
}

export interface IManualWatchdogCondition
{
    /** Gate name to control */
    gateName: string;
    /** Gate value required for the security */
    gateValue: number;
}