import { IIOPhysicalController, IOControllersTypes } from "../../../interfaces/IIOControllers";

export class IOPhysicalController implements IIOPhysicalController
{
    public type: IOControllersTypes;
    public ip: string;

    public connected = false;

    public unreachable = false;

    constructor(type: IOControllersTypes, ip: string)
    {
        this.type = type;
        this.ip = ip;
    }

    async connect(): Promise<boolean> { return false; }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async writeData(_address: number, _data: number, _word?: boolean): Promise<void> { return; }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async readData(_address: number, _word?: boolean): Promise<number> { return 0; }

    toJSON()
    {
        return {
            type: this.type,
            ip: this.ip,
            connected: this.connected
        };
    }
}