import type { IOBase, SerialCom } from "@metalizzsas/nuster-typings/src/spec/iohandlers";

import { LoggerInstance } from "../../app";
import { SerialPort } from "serialport";

export class Serial implements IOBase, SerialCom
{
    type = "serial" as const;

    connected = false;
    unreachable = false;
    
    ip = "";
    port: string;
    baudRate: number;

    serialPort?: SerialPort;

    constructor(port: string, baudRate: number)
    {
        this.baudRate = baudRate;
        this.port = port;

        this.connect(); 
    }
    
    async connect(): Promise<boolean>
    {
        return new Promise<boolean>(resolve => {
            this.serialPort = new SerialPort({ path: this.port, baudRate: this.baudRate }, (err) => {
                if(err)
                {
                    LoggerInstance.error("Serial " + err.message);
                }
                else
                {
                    this.connected = true;

                    LoggerInstance.info("Serial: Connected");
                    this.serialPort?.addListener("close", () => { 
                        this.connected = false; 
                        LoggerInstance.info("Serial: Disconnected")
                    });
                }
                resolve(err === null);
            });
        });
    }

    async writeData(_address: number, data: number): Promise<void>
    {        
        if(!this.connected)
        {
            const connected = await this.connect();

            if(!connected)
                return;
        }

        this.serialPort?.write(`${data}\n`);
    }

    async readData(): Promise<number>
    {
        throw Error("SerialError: Not implemented");
    }

    toJSON()
    {
        return {
            type: this.type,
            ip: this.ip,
            port: this.port,
            baudRate: this.baudRate
        }
    }
}