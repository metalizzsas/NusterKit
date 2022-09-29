import { IMappedGate } from "./IMappedGate";
import { IUM18Gate } from "./IUM18Gate";
import { IPT100Gate } from "./IPT100Gate";
import { IDefaultGate } from "./IDefaultGate";

export type IOGateTypeName = "pt100" | "um18" | "mapped" | "default";

export interface IIOGateConfig
{
    /** Gate name */
    name: string;
    
    /** Gate controller data size */
    size: "bit" | "word";
    /** Gate bus */
    bus: "in" | "out";
    /** Gate type */
    type: IOGateTypeName;
    
    /** Automaton where this gate is available */
    controllerId: number;
    /** Address on the automaton address range */
    address: number;
    
    /** Default value of this gate */
    default: number;
    
    /** Unity used by this gate */
    unity?: string;
    
}
export type IOGatesConfig = (IDefaultGate | IUM18Gate | IMappedGate | IPT100Gate) & IIOGateConfig;

export interface IIOGate extends IIOGateConfig
{
    category: string;
    value: number;

    /** Reads the value of the gate */
    read(): Promise<boolean>
    
    /** 
     * Writes data to the gate
     * @param data Data to write to the gate
     */
    write(data: number): Promise<boolean>
}
export type IOGates = (IDefaultGate | IUM18Gate | IMappedGate | IPT100Gate) & IIOGate;