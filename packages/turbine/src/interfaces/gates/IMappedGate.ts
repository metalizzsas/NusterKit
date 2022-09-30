import { IIOGateConfig } from "./IIOGate";

/** Mapped gates, converts automatically data from controller to Human readable data */
export interface IMappedGate extends IIOGateConfig
{
    type: "mapped";
    /** Size is always a word for this typoe of Gate */
    size: "word";

    /** Mapped output min data, to Human */
    mapOutMin: number;
    
    /** Mapped output max data, to Human */
    mapOutMax: number;

    /** 
     * Mapped input min data, from IO Controller
     * @defaultValue 0
     */
    mapInMin?: number;
    /** 
     * Mapped input max data, from IOController
     * @defaultValue 32767
     */
    mapInMax?: number;
}