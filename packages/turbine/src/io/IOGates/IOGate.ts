import type { IOGateBase, IOGates } from "$types/spec/iogates";
import { TurbineEventLoop } from "../../events";
import type { IOBase } from "$types/spec/iohandlers";
import type { IOGateJSON } from "$types/hydrated/io";

export class IOGate implements IOGateBase
{
    name: string;
    category: string;

    locked = false;

    size: "word" | "bit";
    bus: "out" | "in";
    type: IOGates["type"];

    controllerId: number;
    controllerInstance: IOBase;
    address: number;
    default: number;
    unity?: string | undefined;

    /** Gate value read or written to controller */
    value: number;

    constructor(obj: IOGates, controllerInstance: IOBase)
    {
        this.name = obj.name;
        this.category = (obj.name.split("#").length > 1) ? obj.name.split("#")[0] : "generic";
        this.unity = obj.unity;

        this.size = obj.size;
        this.type = obj.type;
        this.bus = obj.bus;

        this.controllerId = obj.controllerId;
        this.controllerInstance = controllerInstance;
        this.address = obj.address;

        this.default = obj.default;

        // Initialize the gate with its default value
        this.value = obj.default;

        TurbineEventLoop.on(`io.update.${this.name}`, async (options) => {

            if(options.lock !== undefined)
            {
                if(this.locked != options.lock)
                    TurbineEventLoop.emit("log", "warning", "IOG-" + this.name + ": Lock state has been updated to " + options.lock);

                this.locked = options.lock;
            }

            await this.write(options.value);
            await options.callback?.();
        });
    }
    
    async read(): Promise<boolean>
    {
        if(this.bus == 'out') return true;

        const word = this.size == "word" ? true : undefined;
        const controllerData = await this.readFromController(word);
        this.value = controllerData;
        TurbineEventLoop.emit(`io.updated.${this.name}`, this.toJSON());

        return true;
    }

    async write(data: number): Promise<boolean>
    {
        if(this.bus == 'in')
            return true;

         TurbineEventLoop.emit('log', 'info', "IOG-" + this.name + ": Writing (" + data + ") to fieldbus.");
        
        const word = this.size == "word" ? true : undefined;
        await this.writetoController(data, word);
        this.value = data;

        TurbineEventLoop.emit(`io.updated.${this.name}`, this.toJSON());

        return true;
    }

    async readFromController(word?: true): Promise<number>
    {
        return await this.controllerInstance.readData(this.address, word);
    }

    async writetoController(data: number, word?: true): Promise<boolean>
    {
        await this.controllerInstance.writeData(this.address, data, word);
        return true;
    }

    toJSON(): IOGateJSON
    {
        return {
            name: this.name,
            type: this.type,
            locked: this.locked,
            category: this.category,
            value: this.value,
            unity: this.unity,
            bus: this.bus,
            size: this.size
        }
    }
}