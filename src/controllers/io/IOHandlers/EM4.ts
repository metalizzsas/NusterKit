import ModbusTCP from "modbus-serial";
import ping from "ping";
import { LoggerInstance } from "../../../app";
import { IOPhysicalController } from "./IOPhysicalController";

export class EM4 extends IOPhysicalController
{
    public client: ModbusTCP;
    private connectTimer?: NodeJS.Timer;

    constructor(ip: string)
    {
        super("em4", ip);

        this.client = new ModbusTCP();
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
            await this.client.connectTCP(this.ip, {port: 502}).catch(error => LoggerInstance.error("EM4: " + error));

            this.connected = this.client.isOpen;

            if(this.connected)
            {
                LoggerInstance.info("EM4: Connected");

                //check if the TCP tunnel is alive
                if(this.connectTimer)
                    clearInterval(this.connectTimer);
    
                this.connectTimer = setInterval(() => {
                    this.connected = this.client.isOpen;
                    if(this.connected === false)
                    {
                        LoggerInstance.info("EM4: Disconnected");
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
            LoggerInstance.error(`EM4: Failed to ping, cancelling connection.`);
            return false;
        }
    }

    async writeData(address: number, data: number, word?: boolean): Promise<void>
    {
        if(this.unreachable)
        {
            //this.machine?.cycleController.program?.end("controllerUnreachable"); //TODO
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
            //this.machine?.cycleController.program?.end("controllerUnreachable"); //TODO
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