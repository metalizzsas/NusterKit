import { IDefaultGate } from "../../../interfaces/gates/IDefaultGate";
import { IIOGate } from "../../../interfaces/gates/IIOGate";
import { IOGate } from "./IOGate";

export class DefaultGate extends IOGate implements IIOGate, IDefaultGate
{
    type = "default" as const;

    constructor(obj: IDefaultGate)
    {
        super(obj);
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