import type { DefaultGate as DefaultGateConfig } from "$types/spec/iogates";
import { IOGate } from "./IOGate";
import type { IOBase } from "$types/spec/iohandlers";

export class DefaultGate extends IOGate implements DefaultGateConfig
{
    type = "default" as const;

    constructor(obj: DefaultGateConfig, controllerInstance: IOBase)
    {
        super(obj, controllerInstance);
    }

    public async read(): Promise<boolean>
    {
        return super.read();
    }

    public async write(data: number): Promise<boolean>
    {
        return super.write(data);
    }
}