import { IBaseMaintenance } from ".";

export interface ICountableMaintenance extends IBaseMaintenance{

    durationType: "cycle" | "duration";

    /** When this duration is reached maitnenance is due */
    durationLimit: number;

}