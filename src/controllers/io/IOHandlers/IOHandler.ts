export class IOHandler implements IIOHandler
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
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async writeData(_address: number, _data: number, _word?: boolean): Promise<void> { return; }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async readData(_address: number, _word?: boolean): Promise<number> { return 0; }
}

export interface IIOHandler
{
    name: string;
    type: string;
    ip: string;
}