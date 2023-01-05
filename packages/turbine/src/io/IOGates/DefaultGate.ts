import type { DefaultGate as DefaultGateConfig } from "@metalizzsas/nuster-typings/build/spec/iogates";
import { IOGate } from "./IOGate";
import type { IOBase } from "@metalizzsas/nuster-typings/build/spec/iohandlers";

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