import ModbusTCP from "modbus-serial";
import { IOHandler } from "./IOHandler";

export class WAGO extends IOHandler
{
    public client: ModbusTCP;

    constructor(ip: string)
    {
        super("WAGO", "modbus", ip);

        this.client = new ModbusTCP();
        this.connect();
    }
    async connect()
    {
        await this.client.connectTCP(this.ip, {port: 502});

        this.connected = this.client.isOpen;

        //check if the TCP tunnel is alive
        setInterval(() => {
            this.connected = this.client.isOpen;
        }, 2000);
    }

    async writeData(address: number, data: number, word?: boolean): Promise<void>
    {
        if(!this.client.isOpen)
            await this.connect();

        if(word && word == true)
        {
            await this.client.writeRegister(address, data);
        }
        else
        {
            await this.client.writeCoil(address, data == 1);
        }
    }
    async readData(address: number, word?: boolean): Promise<number>
    {

        if(!this.client.isOpen)
            await this.connect();

        let result = null;

        if(word && word == true)
        {
            result = await this.client.readInputRegisters(address, 1);
            //console.log(result);
            return result.data[0];
        }
        else
        {
            result = await this.client.readCoils(address, 1);
            return result.data[0] ? 1 : 0;
        }
    }
}