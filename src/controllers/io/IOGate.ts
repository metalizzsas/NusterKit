export class IOGate
{
    name: string;
    type: string;
    bus: IOGateBus;
    automaton: number;
    address: string | number;
    default: number;

    value: number;

    constructor(name: string, type: string, bus: IOGateBus, automaton: number, address: string | number, defaultv: number)
    {
        this.name = name;
        this.type = type;
        this.bus = bus;
        this.automaton = automaton;
        this.address = address;
        this.default = defaultv;
        this.value = this.default;
    }

    public async toggle(state: number)
    {
        console.log("Set", this.name, "to", state);
        this.value = state;
    }

    public async read()
    {
        return true;
    }

    public async write(data: number)
    {
        return true;
    }
}

export enum IOGateBus{
    IN = "in",
    OUT = "out"
}