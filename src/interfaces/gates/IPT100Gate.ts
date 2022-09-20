import { IIOGate } from "./IIOGate";

export interface IPT100Gate extends IIOGate
{
    type: "pt100",
    size: "word",
    unity: "°C"
}