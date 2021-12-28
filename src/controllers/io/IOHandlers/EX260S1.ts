import { IOHandler } from "./IOHandler";

import st from "st-ethernet-ip";

export class EX260S1 extends IOHandler
{
    private controller: st.EthernetIP.ENIP
    private isReady: boolean;

    constructor(ip: string)
    {
        super("ex260s1", "ethip", ip);

        this.controller = new st.EthernetIP.ENIP();
        
        this.isReady = false;
        
        if(process.env.NODE_ENV == "Production")
            this.connect();
    }

    async connect()
    {
        console.log("Connecting");
        await this.controller.connect(this.ip);

        this.isReady = true;

        //recconnect ex260 on lost connexion
        this.controller.once('close', async () => { await this.connect() });
    }

    //Method not implemented
    public async readData(address: number, word?: boolean): Promise<number>
    {
        throw new Error("Method not implemented");
    }

    //Shall only be used for local applications
    public async readData2(address: number): Promise<Buffer>
    {
        console.log("Reading at " + address);

        if(!this.isReady)
            throw new Error("Not ready or not connected");
        
        //Path for ethernet ip protocol
        const idPath = Buffer.from([0x20, 0x04, 0x24, address, 0x30, 0x03]);

        //Message router packet
        const MR = st.EthernetIP.CIP.MessageRouter.build(0x0E, idPath, Buffer.alloc(0));

        //write data to the controller
        this.controller.write_cip(MR, false, 10, null);

        return new Promise((resolve, reject) => {
            this.controller.once("SendRRData Received", (data: any | PromiseLike<any>) => {
                resolve(data[1].data);
            });
            setTimeout(() => {reject("Reading Data timed out...")}, 10000);
        })
    }

    public async writeData(address: number, value: number, word?: boolean): Promise<void>
    {
        if(!this.isReady)
            if(process.env.NODE_ENV != "production")
            {
                return;
            }    
        else
            throw new Error("Not ready or not connected");

        await new Promise((resolve) => {
            setTimeout(resolve, 100);
        });

        //Path for ethernet ip protocol
        const idPath = Buffer.from([0x20, 0x04, 0x24, 0x96, 0x30, 0x03]);

        const res = await this.readData2(0x96);

        const result = res.readUIntLE(4, 2);

        console.log(result);

        const strBinaryArray = ("00000000000000000000000000000000" + result.toString(2)).slice(-32);

        //spliting string
        const binaryArray = strBinaryArray.split("");

        const intArray: number[] = [];

        //replcing String to Int
        binaryArray.forEach((part, index, array) => {
            array[index] = part;
            intArray[index] = parseInt(part);
        });

        console.log(binaryArray);
        console.log(intArray);

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