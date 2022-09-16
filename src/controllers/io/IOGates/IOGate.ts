import { IIOGate, EIOGateSize, EIOGateType, EIOGateBus } from "../../../interfaces/gates/IIOGate";
import { IOController } from "../IOController";

export class IOGate implements IIOGate
{
    name: string;
    category: string;

    size: EIOGateSize;
    type: EIOGateType;
    bus: EIOGateBus;

    automaton: number;
    address: number;

    default: number;

    value: number;

    isCritical?: boolean;
    manualModeWatchdog?: boolean;
    unity?: string;

    constructor(obj: IIOGate)
    {
        this.name = obj.name;

        this.category = (obj.name.split("#").length > 1) ? obj.name.split("#")[0] : "generic";

        this.size = obj.size;
        this.type = obj.type;
        this.bus = obj.bus;

        this.automaton = obj.automaton;
        this.address = obj.address;

        this.default = obj.default;
        this.value = this.default;

        this.isCritical = obj.isCritical;

        this.manualModeWatchdog = obj.manualModeWatchdog;
        this.unity = obj.unity;
    }

    public async read(ioController: IOController): Promise<boolean>
    {
        if(this.bus == 'out') return true;

        const word = this.size == EIOGateSize.WORD ? true : undefined;

        //ioController.machine.logger.trace("IOG-" + this.name + ": Reading from fieldbus.");

        this.value = await ioController.handlers[this.automaton].readData(this.address, word);
        return true;
    }

    public async write(ioController: IOController, data: number): Promise<boolean>
    {
        if(this.bus == 'in') return true;
        const word = this.size == EIOGateSize.WORD ? true : undefined;
        
        ioController.machine.logger.trace("IOG-" + this.name + ": Writing (" + data + ") to fieldbus.");

        await ioController.handlers[this.automaton].writeData(this.address, data, word)
        this.value = data;
        return true;
    }
}