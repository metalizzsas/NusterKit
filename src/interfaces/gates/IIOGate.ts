export enum IOGateBus{
    IN = "in",
    OUT = "out"
}

export enum IOGateSize
{
    BIT = "bit",
    WORD = "word"
}

export enum IOGateType
{
    A10V = "a10v",
    EM4A10V = "em4a10v",
    EM4TEMP = "em4temp",
    UM18 = "um18",
    DEFAULT = "default",
}

export interface IIOGate
{
    name: string;

    size: IOGateSize;
    type: IOGateType;
    bus: IOGateBus;

    automaton: number;
    address: number;

    default: number;

    isCritical?: boolean;
    manualModeWatchdog?: boolean;
}