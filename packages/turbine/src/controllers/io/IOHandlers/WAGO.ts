import { IIOPhysicalController } from "@metalizzsas/nuster-typings/build/spec/iophysicalcontrollers";
import { IWagoController } from "@metalizzsas/nuster-typings/build/spec/iophysicalcontrollers/WagoController";
import ModbusTCP from "modbus-serial";
import ping from "ping";

import { LoggerInstance } from "../../../app";
import { CycleController } from "../../cycle/CycleController";

export class WAGO implements IIOPhysicalController, IWagoController
{
    type = "wago" as const;

    connected = false;
    unreachable = false;
    ip: string;

    public client: ModbusTCP;
    private connectTimer?: NodeJS.Timer;

    constructor(ip: string)
    {
        this.ip = ip;
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
            await this.client.connectTCP(this.ip, {port: 502}).catch(error => LoggerInstance.error(`WAGO: ${error}`));

            this.connected = this.client.isOpen;

            if(this.connected)
            {
                LoggerInstance.info("WAGO: Connected");

                //check if the TCP tunnel is alive
                if(this.connectTimer)
                    clearInterval(this.connectTimer);
    
                this.connectTimer = setInterval(() => {
                    this.connected = this.client.isOpen;
                    if(this.connected === false)
                    {
                        LoggerInstance.info("WAGO: Disconnected");
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
            LoggerInstance.error(`WAGO: Failed to ping, cancelling connection.`);
            return false;
        }
    }

    async writeData(address: number, data: number, word?: boolean): Promise<void>
    {
        if(this.unreachable)
        {
            CycleController.getInstance().program?.end("controllerUnreachable");
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
            CycleController.getInstance().program?.end("controllerUnreachable");
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

    toJSON()
    {
        return {
            type: this.type,
            ip: this.ip
        }
    }
}