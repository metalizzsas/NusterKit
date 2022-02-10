import { IManualWatchdogCondition } from "./IManualWatchdogCondition";

export interface IManualMode
{
    name: string,
    controls: string[],
    incompatibility: string[],
    watchdog?: IManualWatchdogCondition[]
}