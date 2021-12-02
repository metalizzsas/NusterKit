export class IOGate
{
    name: string;
    type: string;
    bus: IOGateBus;
    automaton: number;
    address: string | number;
    default: number;

    value?: number;

    constructor(name: string, type: string, bus: IOGateBus, automaton: number, address: string | number, defaultv: number)
    {
        this.name = name;
        this.type = type;
        this.bus = bus;
        this.automaton = automaton;
        this.address = address;
        this.default = defaultv;
    }

    public async toggle(state: number)
    {
        console.log("Set", this.name, "to", state);
        this.value = state;
    }
}

export enum IOGateBus{
    IN = "in",
    OUT = "out"
}