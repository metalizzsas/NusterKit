import { IOHandler } from "./IOHandler";

export class EX260S3 extends IOHandler
{
    constructor(ip: string)
    {
        super("ex260s3", "ethip", ip);
    }

    public async readData(address: number): Promise<number>
    {
        return 0;
    }

    public async writeData(address: number, value: number): Promise<boolean>
    {
        return false;
    }
}