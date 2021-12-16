import { IOHandler } from "./IOHandler";

export class EX260S1 extends IOHandler
{
    constructor(ip: string)
    {
        super("ex260s3", "ethip", ip);
    }

    public async readData(address: number, word?: boolean): Promise<number>
    {
        return 0;
    }

    public async writeData(address: number, value: number, word?: boolean): Promise<void>
    {
        return;
    }
}