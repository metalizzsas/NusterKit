import { Buffer } from "buffer";
import ping from "ping";
import { ENIP } from "enip-ts";
import { MessageRouter } from "enip-ts/dist/enip/cip/messageRouter";
import type { Encapsulation } from "enip-ts/dist/enip/encapsulation";

import type { IOBase, EX260Sx as EX260SxConfig } from "@metalizzsas/nuster-typings/build/spec/iohandlers";
import { TurbineEventLoop } from "../../events";

export class EX260Sx implements IOBase, EX260SxConfig
{
    type = "ex260sx" as const;
    
    connected = false;
    unreachable = false;
    ip: string;
    
    size: 16 | 32;
    
    private controller: ENIP.SocketController;
    /**
     * Builds an EX260Sx object
     * @param ip Ip address of the controller
     */
    constructor(ip: string, size: 16 | 32)
    {
        this.ip = ip;
        this.size = size;
        
        this.controller = new ENIP.SocketController(120000);

        //change state if disconnected
        this.controller.events.on('close', () => { 
             TurbineEventLoop.emit('log', 'info', "EX260Sx: Disconnected");
            this.connected = false;

            this.controller.close();
        });

        this.connect();
    }
    
    async connect(): Promise<boolean>
    {
        if(this.connected)
            return true;

        if(this.unreachable)
            return false;
        
        const available = await new Promise<boolean>((resolve) => {
            ping.sys.probe(this.ip, (isAlive) => {
                resolve(isAlive || false);
            });
        });

        if(available)
        {
            const sessionID = await this.controller.connect(this.ip);

            if(sessionID !== undefined)
            {
                 TurbineEventLoop.emit('log', 'info', "EX260Sx: Connected");
                this.connected = true;
                return true;
            }
            else
            {
                 TurbineEventLoop.emit('log', 'error', "EX260Sx: Failed to connect");
                TurbineEventLoop.emit(`pbr.stop`, "controllerError");
                this.connected = false;
                return false;
            } 
        }
        else
        {
            this.unreachable = true;
             TurbineEventLoop.emit('log', 'error', `EX260Sx: Failed to ping, cancelling connection.`);
            return false;
        }
    }

    /**
     * Unused read data function
     * @unused
     * @param _address 
     * @param _word 
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    readData(_address: number, _word?: boolean | undefined): Promise<number> {
        throw new Error("Method not implemented.");
    }

    //Shall only be used for local applications
    async readData2(address: number): Promise<Buffer>
    {
        if(this.unreachable)
            throw "EX260Sx: Unreachable";

        await this.connect();
        
        //Path for ethernet ip protocol
        const idPath = Buffer.from([0x20, 0x04, 0x24, address, 0x30, 0x03]);

        //Message router packet
        const MR = MessageRouter.build(0x0E, idPath, Buffer.alloc(0));

        //write data to the controller
        const write = await this.controller.write(MR, false, 10);

        if(!write)
        {
             TurbineEventLoop.emit('log', 'error', "EX260Sx: Failed to write data");
            TurbineEventLoop.emit(`pbr.stop`, "controllerError");
            return Buffer.alloc(0);
        }

        return new Promise<Buffer>((resolve) => {
            this.controller.events.once("SendRRData Received", (result: Encapsulation.CPF.dataItem[]) => {
                for(const packet of result)
                {
                    if(packet.TypeID == 178 && packet.data.length == (4 + (this.size / 8)) && packet.data.readUIntLE(0, 1) == 0x8E)
                    {
                        resolve(packet.data);
                    }
                }
            });
        })
    }

    async writeData(address: number, value: number): Promise<void>
    {
        if(this.unreachable)
            throw "EX260Sx: Unreachable";

        await this.connect();

        //patch to prevent writing too early
        await new Promise((resolve) => {
            setTimeout(resolve, 50);
        });

        //Path for ethernet ip protocol
        const idPath = Buffer.from([0x20, 0x04, 0x24, 0x96, 0x30, 0x03]);

        const res = await this.readData2(0x96);

        //Data to read deprends on size of the EX260
        const result = res.readUIntLE(4, this.size / 8);

        //Str binary array result depends on size of the EX260
        const strBinaryArray = (this.size == 32) ? ("00000000000000000000000000000000" + result.toString(2)).slice(-32) : ("0000000000000000" + result.toString(2)).slice(-16);

        //spliting string
        const binaryArray = strBinaryArray.split("");

        const intArray: number[] = [];

        //replcing String to Int
        binaryArray.forEach((part, index, array) => {
            array[index] = part;
            intArray[index] = parseInt(part);
        });

        //Setting the written data
        for(let i = 0; i < binaryArray.length; i++)
        {                        
            //if the address is the same as the one we want to write    
            if(i == address)
                binaryArray[i] = value ? "1" : "0";
        }

        //converting array of bit to long bit
        const newOutputsStates = binaryArray.join("");

        //convert bin array to int
        const newDecimalOutputState = parseInt(newOutputsStates, 2);

        const buf = Buffer.alloc(this.size / 8);

        if(this.size == 32)
            buf.writeUInt32LE(newDecimalOutputState);
        else
            buf.writeUInt16LE(newDecimalOutputState);

        //Message router packet
        const MR = MessageRouter.build(0x10, idPath, buf);
        
        //write data to the controller
        const write = await this.controller.write(MR, false, 10);

        if(write === false)
        {
             TurbineEventLoop.emit('log', 'warning', "EX260Sx: Failed to write data");
            TurbineEventLoop.emit(`pbr.stop`, "controllerError");
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