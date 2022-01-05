import { IOController } from "../IOController";

export class IOGate implements IIOGate
{
    name: string;

    size: IOGateSize;
    type: IOGateType;
    bus: IOGateBus;

    automaton: number;
    address: number;

    default: number;

    maxDist: number;

    value: number;

    constructor(obj: IIOGate)
    {
        this.name = obj.name;

        this.size = obj.size;
        this.type = obj.type;
        this.bus = obj.bus;

        this.automaton = obj.automaton;
        this.address = obj.address;

        this.default = obj.default;
        this.value = this.default;

        //Only for um18
        this.maxDist = obj.maxDist;
    }

    public async read(ioController: IOController)
    {
        const word = this.size == IOGateSize.WORD ? true : undefined;
        this.value = await ioController.handlers[this.automaton].readData(this.address, word);
        return true;
    }

    public async write(ioController: IOController, data: number)
    {
        const word = this.size == IOGateSize.WORD ? true : undefined;
        
        await ioController.handlers[this.automaton].writeData(this.address, data, word)
        this.value = data;
        return true;
    }
}

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
    UM18 = "um18",
    DEFAULT = "default"
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

    //maximum distance for UM18 sensor
    maxDist: number;
}