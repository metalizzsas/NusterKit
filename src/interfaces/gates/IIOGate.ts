export enum EIOGateBus{
    IN = "in",
    OUT = "out"
}

export enum EIOGateSize
{
    BIT = "bit",
    WORD = "word"
}

export enum EIOGateType
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

    size: EIOGateSize;
    type: EIOGateType;
    bus: EIOGateBus;

    automaton: number;
    address: number;

    default: number;

    isCritical?: boolean;
    manualModeWatchdog?: boolean;
}