export class IOHandler
{
    public name: string;
    public type: string;
    public ip: string;

    constructor(name: string, type: string, ip: string)
    {
        this.name = name;
        this.type = type;
        this.ip = ip;
    }

    async writeData(address: number, data: number, word?: boolean): Promise<void> {}
    async readData(address: number, word?: boolean): Promise<number> { return 0; }
}