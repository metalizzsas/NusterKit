import { IBaseMaintenance } from ".";
import { IMachineSpecs } from "..";

export interface ISensorMaintenance extends IBaseMaintenance
{
    durationType: "sensor";

    /** When this value is reached on sensor maintenance is due */
    sensorLimitValue: number;
    /** When this value is reached on sensor means that maintenance task has been done */
    sensorBaseValue: number;

    /** Sensor gate to check */
    sensorGate: IMachineSpecs["iogates"][number]["name"];
    /** Gate needed to check maitnenance task */
    requireEnableGate?: IMachineSpecs["iogates"][number]["name"];
}