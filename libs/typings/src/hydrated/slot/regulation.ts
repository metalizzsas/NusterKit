import { IRegulation } from "../../spec/slot/regulation";

export interface IRegulationStoredData {
    currentValue: number,
    targetValue: number,

    state: boolean,
    time: string,
}

export type IRegulationHydrated = Omit<IRegulation, "actuators" | "manualModes" | "sensors"> & IRegulationAdditional

type IRegulationAdditional = {
    current: number,
    state: boolean;
    logData: IRegulationStoredData[]
}