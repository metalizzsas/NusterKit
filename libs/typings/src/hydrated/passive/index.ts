import { IConfigPassive } from "../../spec/passive";

export interface IPassiveStoredLogData {
    targetValue: number,
    state: boolean,

    interpolatedSensorsValue: number,
    time: Date,
}

export type IPassiveHydrated = Omit<IConfigPassive, "actuators" | "manualModes" | "sensors"> & 
{
    current: number,
    state: boolean;
    logData: IPassiveStoredLogData[]
}