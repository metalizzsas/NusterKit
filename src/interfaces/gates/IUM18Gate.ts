import { IIOGate } from "./IIOGate";

export interface IUM18Gate extends IIOGate
{
    type: "um18";
    levelMax: number;
}