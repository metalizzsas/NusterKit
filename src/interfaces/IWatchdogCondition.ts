export interface IWatchdogCondition
{
    gateName: string;
    gateValue: number;
    startOnly: boolean;

    result: boolean;
}