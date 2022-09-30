import { IIOGateConfig } from ".";

export interface IPT100Gate extends IIOGateConfig
{
    type: "pt100",
    size: "word",
    unity: "°C",
    bus: "in"
}