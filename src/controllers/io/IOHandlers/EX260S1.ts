/* eslint-disable @typescript-eslint/no-unused-vars */
import { IOHandler } from "./IOHandler";

// st-ethernet-ip has no definitions going blind here
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import st from "st-ethernet-ip";

import process from "process";
import { Buffer } from "buffer";
import ping from "ping";

export class EX260S1 extends IOHandler
{

    private controller: st.EthernetIP.ENIP;

    private prevBuffer: Buffer = Buffer.alloc(0);

    /**
     * Builds an EX260S1 object
     * @param {String} ip 
     */
    constructor(ip: string)
    {
        super("ex260s1", "ethip", ip);

        this.controller = new st.EthernetIP.ENIP();
        
        this.connected = false;
        
        this.connect();
    }

    async connect()
    {
        if(this.unreachable || process.env.DISABLE_EX260 == 'true')
            return;
        
        const available = await new Promise((resolve) => {
            ping.sys.probe(this.ip, (isAlive) => {
                resolve(isAlive);
            });
        });

        if(available)
        {
            try
            {
                await this.controller.connect(this.ip);
    
                this.connected = true;
    
                //recconnect ex260 on lost connexion
                this.controller.once('close', async () => { this.connected = false; await this.connect(); });
            }
            catch(error)
            {
                this.connected = false;
                throw error; // will be catched by process.on('uncaughtException');
                return;
            }
        }
        else
        {
            this.unreachable = true;
            throw Error(`Failed to ping to ${this.name}, cancelling connection.`);
        }
    }

    async readData(_address: number, _word?: boolean | undefined)
    {
        throw new Error("Method not implemented");
        return 0;
    }

    //Shall only be used for local applications
    async readData2(address: number): Promise<Buffer>
    {
        if(this.unreachable || process.env.DISABLE_EX260 == 'true')
            return Buffer.alloc(0);

        if(!this.connected)
            await this.connect();
        
        //Path for ethernet ip protocol
        const idPath = Buffer.from([0x20, 0x04, 0x24, address, 0x30, 0x03]);

        //Message router packet
        const MR = st.EthernetIP.CIP.MessageRouter.build(0x0E, idPath, Buffer.alloc(0));

        //write data to the controller
        this.controller.write_cip(MR, false, 10, null);

        return new Promise((resolve, reject) => {
            this.controller.once("SendRRData Received", (data: any) => {
                //FIXME: Ajouter un check du packet id 178
                resolve(data[1].data);
            });
            setTimeout(() => {reject("Reading Data timed out...")}, 10000);
        })
    }

    /**
     * Write data to EX260-SEN1 module
     * @param {number} address 
     * @param {number} value 
     * @param {Boolean?} _word Optional
     * @returns 
     */
    async writeData(address: number, value: number, _word = false): Promise<void>
    {
        if(this.unreachable || process.env.DISABLE_EX260 == 'true')
            return;

        if(!this.connected)
            await this.connect();    

        //patch to prevent writing too early
        await new Promise((resolve) => {
            setTimeout(resolve, 25);
        });

        //Path for ethernet ip protocol
        const idPath = Buffer.from([0x20, 0x04, 0x24, 0x96, 0x30, 0x03]);

        const res = await this.readData2(0x96);

        const result = res.readUIntLE(4, 4);

        const strBinaryArray = ("00000000000000000000000000000000" + result.toString(2)).slice(-32);

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

        const buf = Buffer.alloc(4);
        buf.writeUInt32LE(newDecimalOutputState);

        //Message router packet
        const MR = st.EthernetIP.CIP.MessageRouter.build(0x10, idPath, buf);
        
        //write data to the controller

        return new Promise((resolve, reject) => {
            this.controller.write_cip(MR, false, 10, (err: any) => {
                if(err) reject(err);
                else resolve();
            });
        });
    }
}