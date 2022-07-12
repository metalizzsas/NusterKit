export interface IManualMode
{
    name: string,

    controls: ({
        name: string;
        analogScaleDependant: boolean;
    } | string)[],
    
    incompatibility?: string[],
    requires?: string[],
    watchdog?: IManualWatchdogCondition[]

    analogScale?: {
        min: number;
        max: number;
    }
}

export interface IManualWatchdogCondition
{
    gateName: string;
    gateValue: number;
}