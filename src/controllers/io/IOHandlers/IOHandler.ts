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
}