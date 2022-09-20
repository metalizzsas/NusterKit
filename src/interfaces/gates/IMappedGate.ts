import { IIOGate } from "./IIOGate";

export interface IMappedGate extends IIOGate
{
    type: "mapped";
    size: "word";

    mapInMin: number;
    mapInMax: number;

    mapOutMin: number;
    mapOutMax: number;
}