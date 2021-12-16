import { IOController } from "../IOController";

export class IOGate implements IIOGate
{
    name: string;
    type: string;
    bus: IOGateBus;
    automaton: number;
    address: number;
    default: number;

    value: number;

    level?: IIOGateLevel

    constructor(obj: IIOGate)
    {
        this.name = obj.name;
        this.type = obj.type;
        this.bus = obj.bus;
        this.automaton = obj.automaton;
        this.address = obj.address;
        this.default = obj.default;
        this.value = this.default;

        this.level = obj.level;
    }

    public async toggle(state: number)
    {
        console.log("Set", this.name, "to", state);
        this.value = state;
    }

    public async read(ioController: IOController)
    {
        let word = this.type == "word" ? true : undefined;
        this.value = await ioController.handlers[this.automaton].readData(this.address, word);
        return true;
    }

    public async write(ioController: IOController, data: number)
    {
        let word = this.type == "word" ? true : undefined;
        
        await ioController.handlers[this.automaton].writeData(this.address, data, word)
        this.value = data;
        return true;
    }
}

export enum IOGateBus{
    IN = "in",
    OUT = "out"
}

export interface IIOGate
{
    name: string;
    type: string;
    bus: IOGateBus;
    automaton: number;
    address: number;
    default: number;

    value: number;

    level?: IIOGateLevel
}

interface IIOGateLevel
{
    minHeight: number,
    maxHeight: number
}