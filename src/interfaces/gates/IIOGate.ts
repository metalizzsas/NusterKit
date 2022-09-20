import { IMappedGate } from "./IMappedGate";
import { IUM18Gate } from "./IUM18Gate";
import { IPT100Gate } from "./IPT100Gate";

export type IOGateTypeName = "pt100" | "um18" | "mapped" | "default";

export type IOGateTypes = (IDefaultGate | IUM18Gate | IMappedGate | IPT100Gate) & IIOGate;

export interface IIOGate
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
    /** Address on the automaton IPV4 */
    address: number;

    /** Default value of this gate */
    default: number;

    /** Is this gate Critical */
    isCritical?: boolean;
    /** Does this gate triggers manual mode watchdog security */
    manualModeWatchdog?: boolean;
    /** Unity used by this gate */
    unity?: string;
}

export interface IDefaultGate extends IIOGate {
    type: "default";
}
