import { IOHandler } from "./IOHandler";
import process from "process";
import { Buffer } from "buffer";
import ping from "ping";
import { Machine } from "../../../Machine";
import { ENIP } from "ts-enip";
import { MessageRouter } from "ts-enip/dist/enip/cip/messageRouter";
import { Encapsulation } from "ts-enip/dist/enip/encapsulation";

export class EX260S1 extends IOHandler
{
    private controller: ENIP.SocketController;
    private machine?: Machine;

    /**
     * Builds an EX260S1 object
     * @param {String} ip 
     */
    constructor(ip: string, machine?: Machine)
    {
        super("ex260s1", "ethip", ip);
        
        this.controller = new ENIP.SocketController();
        this.connected = false;

        this.machine = machine;
        
        this.connect();
    }

    async connect(): Promise<boolean>
    {
        if(this.unreachable || process.env.DISABLE_EX260 == 'true')
            return false;
        
        const available = await new Promise((resolve) => {
            ping.sys.probe(this.ip, (isAlive) => {
                resolve(isAlive);
            });
        });

        if(available)
        {
            const sessionID = await this.controller.connect(this.ip);

            if(sessionID !== undefined)
            {
                this.connected = true;
                this.machine?.logger.info("EX260S1: Connected");
                //recconnect ex260 on lost connexion
                this.controller.events.once('close', async () => { 
                    this.machine?.logger.info("EX260S1: Disconnected");
                    this.connected = false; await this.connect(); });
                return true;
            }
            else
            {
                this.connected = false;
                this.machine?.logger.error("EX260S1: Failed to connect");
                this.machine?.cycleController.program?.end("controllerError");
                await new Promise(resolve => setTimeout(resolve, 1000));
                return await this.connect();
            } 
        }
        else
        {
            this.unreachable = true;
            this.machine?.logger.error(`EX260S1: Failed to ping, cancelling connection.`);
            return false;
        }
    }

    override async readData()
    {
        throw new Error("Method not implemented");
        return 0;
    }

    //Shall only be used for local applications
    async readData2(address: number): Promise<Buffer>
    {
        if(this.unreachable || process.env.DISABLE_EX260 == 'true')
            return Buffer.alloc(0);

        if(!this.connected || this.controller === undefined)
            await this.connect();
        
        //Path for ethernet ip protocol
        const idPath = Buffer.from([0x20, 0x04, 0x24, address, 0x30, 0x03]);

        //Message router packet
        const MR = MessageRouter.build(0x0E, idPath, Buffer.alloc(0));

        //write data to the controller
        const write = await new Promise<Error | undefined>((resolve) => {
            this.controller.write(MR, false, 10, (err?: Error) => {
                resolve(err);
            });
        });

        if(write)
        {
            this.machine?.cycleController.program?.end("controllerError");
            return Buffer.alloc(0);
        }

        return new Promise<Buffer>((resolve) => {
            this.controller.events.once("SendRRData Received", (result: Encapsulation.CPF.dataItem[]) => {
                for(const packet of result)
                {
                    if(packet.TypeID == 178 && packet.data.length == 8 && packet.data.readUIntLE(0, 1) == 0x8E)
                    {
                        resolve(packet.data);
                    }
                }
            });
        })
    }

    /**
     * Write data to EX260-SEN1 module
     * @param {number} address 
     * @param {number} value 
     * @param {Boolean?} _word Optional
     * @returns 
     */
    override async writeData(address: number, value: number): Promise<void>
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
        const MR = MessageRouter.build(0x10, idPath, buf);
        
        //write data to the controller

        return new Promise((resolve, reject) => {
            this.controller.write(MR, false, 10, (err?: Error) => {
                if(err)
                {
                    reject(err);
                    this.machine?.cycleController.program?.end("controllerError");
                }
                else resolve();
            });
        });
    }
}