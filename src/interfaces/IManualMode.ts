import { IManualWatchdogCondition } from "./IManualWatchdogCondition";

export interface IManualMode
{
    name: string,
    controls: {
        name: string;
        analogScaleDependant?: boolean;
    }[],
    incompatibility: string[],
    watchdog?: IManualWatchdogCondition[]
    analogScale?: {
        min: number;
        max: number;
    }
}