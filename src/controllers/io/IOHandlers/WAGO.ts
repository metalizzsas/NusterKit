import ModbusTCP from "modbus-serial";
import { IOHandler } from "./IOHandler";
import ping from "ping";
import { Machine } from "../../../Machine";
import { EIOHandlerType } from "../../../interfaces/IIOHandler";

export class WAGO extends IOHandler
{
    public client: ModbusTCP;

    private machine?: Machine;

    private connectTimer?: NodeJS.Timer;

    constructor(ip: string, machine?: Machine)
    {
        super("WAGO", EIOHandlerType.WAGO, ip);

        this.client = new ModbusTCP();
        this.machine = machine;
        this.connect(); 
    }
    async connect(): Promise<boolean>
    {
        if(this.unreachable)
            return false;
        
        const available = await new Promise<boolean>((resolve) => {
            ping.sys.probe(this.ip, (isAlive) => resolve(isAlive ?? false));
        });
        
        if(available === true)
        {
            await this.client.connectTCP(this.ip, {port: 502}).catch(error => console.log(error));

            this.connected = this.client.isOpen;

            if(this.connected)
            {
                this.machine?.logger.info("WAGO: Connected");

                //check if the TCP tunnel is alive
                if(this.connectTimer)
                    clearInterval(this.connectTimer);
    
                this.connectTimer = setInterval(() => {
                    this.connected = this.client.isOpen;
                    if(this.connected === false)
                    {
                        this.machine?.logger.info("WAGO: Disconnected");
                        this.connect();
                    }
                        
                }, 2000);
    
                return true;
            }
            else
            {
                return false;
            }
        }
        else
        {
            this.unreachable = true;
            this.machine?.logger.error(`WAGO: Failed to ping, cancelling connection.`);
            return false;
        }
    }

    async writeData(address: number, data: number, word?: boolean): Promise<void>
    {
        if(this.unreachable)
        {
            this.machine?.cycleController.program?.end("controllerUnreachable");
            return;
        }
        
        if(!this.client.isOpen)
        {
            const connected = await this.connect();

            if(!connected)
                return;
        }

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
        if(this.unreachable)
        {
            this.machine?.cycleController.program?.end("controllerUnreachable");
            return 0;
        }

        if(!this.client.isOpen)
        {
            const connected = await this.connect();

            if(!connected)
                return 0;
        }

        let result = null;

        if(word && word == true)
        {
            result = await this.client.readHoldingRegisters(address, 1);
            return result.data[0];
        }
        else
        {
            result = await this.client.readCoils(address, 1);
            return result.data[0] ? 1 : 0;
        }
    }
}