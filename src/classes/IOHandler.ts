export class IOHandler
{
    name: string;
    type: string;
    ip: string;

    constructor(name: string, type: string, ip: string)
    {
        this.name = name;
        this.type = type;
        this.ip = ip;
    }
}