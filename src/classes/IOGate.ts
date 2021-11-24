export class IOGate
{
    name: string;
    type: string;
    bus: IOGateBus;
    automaton: number;
    address: string | number;
    default: number;

    constructor(name: string, type: string, bus: IOGateBus, automaton: number, address: string | number, defaultv: number)
    {
        this.name = name;
        this.type = type;
        this.bus = bus;
        this.automaton = automaton;
        this.address = address;
        this.default = defaultv;
    }
}

export enum IOGateBus{
    IN = "in",
    OUT = "out"
}