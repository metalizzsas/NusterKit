import { IOController } from "./IOController";

export class IOGate
{
    name: string;
    type: string;
    bus: IOGateBus;
    automaton: number;
    address: number;
    default: number;

    value: number;

    constructor(name: string, type: string, bus: IOGateBus, automaton: number, address: number, defaultv: number)
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

    public async read(ioController: IOController)
    {
        this.value = await ioController.handlers[this.automaton].readData(this.address);
        return true;
    }

    public async write(ioController: IOController, data: number)
    {
        let word = this.type == "word" ? true : undefined;
        
        await ioController.handlers[this.automaton].writeData(this.address, data, word)
        return true;
    }
}

export enum IOGateBus{
    IN = "in",
    OUT = "out"
}