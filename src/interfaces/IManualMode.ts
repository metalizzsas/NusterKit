import { IManualWatchdogCondition } from "./IManualWatchdogCondition";

export interface IManualMode
{
    name: string,
    controls: (string | IManualModeControl)[],
    incompatibility: string[],
    options?: IManualModeOptions
    watchdog?: IManualWatchdogCondition[]
}

export interface IManualModeOptions
{
    analogScale: boolean;
    analogScaleMin: number;
    analogScaleMax: number;
}

export interface IManualModeControl
{
    name: string;
    analogScaleDependant: boolean;
}
