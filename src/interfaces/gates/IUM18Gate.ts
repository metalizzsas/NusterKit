import { IIOGateConfig } from "./IIOGate";

export interface IUM18Gate extends IIOGateConfig
{
    type: "um18";
    levelMax: number;
}