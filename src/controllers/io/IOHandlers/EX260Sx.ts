import process from "process";
import { Buffer } from "buffer";
import ping from "ping";
import { ENIP } from "ts-enip";
import { MessageRouter } from "ts-enip/dist/enip/cip/messageRouter";
import { Encapsulation } from "ts-enip/dist/enip/encapsulation";
import { IOPhysicalController } from "./IOPhysicalController";
import { IEX260Controller } from "../../../interfaces/IIOControllers";
import { LoggerInstance } from "../../../app";
import { CycleController } from "../../cycle/CycleController";

export class EX260Sx extends IOPhysicalController implements IEX260Controller
{
    private controller: ENIP.SocketController;

    type: "ex260sx";
    size: 16 | 32;

    /**
     * Builds an EX260Sx object
     * @param ip Ip address of the controller
     */
    constructor(ip: string, size: 16 | 32)
    {
        super("ex260sx", ip);

        this.type = "ex260sx";
        this.size = size;
        
        this.controller = new ENIP.SocketController();
        this.connected = false;

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
                LoggerInstance.info("EX260Sx: Connected");

                //change state if disconnected
                this.controller.events.once('close', async () => { 
                    LoggerInstance.info("EX260Sx: Disconnected");
                    this.connected = false; 
                });

                return true;
            }
            else
            {
                this.connected = false;
                LoggerInstance.error("EX260Sx: Failed to connect");
                CycleController.getInstance().program?.end("controllerError");
                return false;
            } 
        }
        else
        {
            this.unreachable = true;
            LoggerInstance.error(`EX260Sx: Failed to ping, cancelling connection.`);
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
        const write = await this.controller.write(MR, false, 10);

        if(!write)
        {
            CycleController.getInstance().program?.end("controllerError");
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

    /**
     * Write data to EX260-SEN1 module
     * @param {number} address 
     * @param {number} value 
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
            CycleController.getInstance().program?.end("controllerError");
        }
    }
}