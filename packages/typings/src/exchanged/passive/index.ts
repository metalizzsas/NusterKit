import { IConfigPassive } from "../../spec/passive";

export interface IPassiveStoredLogData {
    time?: Date,
    state?: boolean

    targetValue: number,
    interpolatedSensorsValue: number,
}

export type ISocketPassive = Omit<IConfigPassive, "actuators" | "manualModes" | "sensors"> & 
{
    current: number,
    state: boolean;
    logData: IPassiveStoredLogData[]
}