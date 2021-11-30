import { EthernetIP } from "ts-ethernet-ip/lib/index";
import { Socket } from "net";
import { IOHandler } from "./IOHandler";

export class PointIOHandler extends IOHandler
{
    public controller: Socket;

    private state = {
        TCP: { establishing: false, established: false },
        session: { id: 0, establishing: false, established: false },
        connection: { id: 0, establishing: false, established: false, seq_num: 0 },
        error: { code: 0, msg: "" }
    };

    constructor(ip: string)
    {
        super("PointIO", "EthernetIP", ip);

        this.controller = new Socket();
        this.controller.setMaxListeners(10);

        this._initializeEventHandlers();

    }

    async connect() {

        const { registerSession } = EthernetIP.encapsulation;

        this.state.session.establishing = true;
        this.state.TCP.establishing = true;

        const connectErr = new Error(
            "TIMEOUT occurred while attempting to establish TCP connection with Controller."
        );

        // Connect to Controller and Then Send Register Session Packet
        await new Promise<void>((resolve, reject)=> {
            let socket = this.controller.connect(
                44818,
                this.ip,
                () => {
                    this.state.TCP.establishing = false;
                    this.state.TCP.established = true;

                    this.controller.write(registerSession());
                    resolve();
                }
            );

            socket.on('error', err => {
                reject(new Error("SOCKET error"));
            })
        })

        const sessionErr = new Error(
            "TIMEOUT occurred while attempting to establish Ethernet/IP session with Controller."
        );

        // Wait for Session to be Registered
        const sessid = await new Promise(resolve => {
            this.controller.on("Session Registered", sessid => {
                resolve(sessid);
            });

            this.controller.on("Session Registration Failed", error => {
                this.state.error.code = error;
                this.state.error.msg = "Failed to Register Session";
                resolve(null);
            });
        })

        // Clean Up Local Listeners
        this.controller.removeAllListeners("Session Registered");
        this.controller.removeAllListeners("Session Registration Failed");

        // Return Session ID
        return sessid;
    }

    /**
     * Write any data to an address to an PointIO Controller
     * @param address address where data must be written
     * @param value value that will be written
     * @returns Write result
     */
    public async write(address: number, value: number): Promise<boolean>
    {
        return false;
    }

    /**
     * Read d-any data at the specified address
     * @param address address where we read the data at
     * @returns Vlaue returned by the controller
     */
    public async read(address: number): Promise<number>
    {
        console.log("Reading at " + address);
        
        //Path for ethernet ip protocol
        const idPath = Buffer.from([0x20, 0x03, 0x24, 0x01]);

        //Message router packet
        const MR = EthernetIP.CIP.MessageRouter.build(14, idPath, Buffer.alloc(0));

        //write data to the controller
        this.write_cip(MR, false, 10, null);

        return new Promise((resolve, reject) => {
            this.controller.once("SendRRData Received", (data) => {
                resolve(data);
            });
            setTimeout(() => {reject("Reading Data timed out...")}, 10000);
        })
    }

    private async write_cip(data: Buffer, connected = false, timeout = 10, cb = null)
    {
        const { sendRRData, sendUnitData } = EthernetIP.encapsulation;
        const { session, connection } = this.state;

        if (this.state.session.established) {
            if(connected === true) {
                if (connection.established === true) {
                    connection.seq_num += 1;
                    if (connection.seq_num > 0xffff) connection.seq_num = 0;
                }
                else {
                    throw new Error ("Connected message request, but no connection established. Forgot forwardOpen?");
                }
            }
            const packet = connected
                ? sendUnitData(this.state.session.id, data, this.state.connection.id, connection.seq_num)
                : sendRRData(this.state.session.id, data, timeout);

            if (cb) {
                this.controller.write(packet, cb);
            } else {
                this.controller.write(packet);
            }
        }
        else
        {
            console.log("connection not established");
            return false;
        }
    }

    private _initializeEventHandlers() {
        this.controller.on("data", this._handleDataEvent.bind(this));
        this.controller.on("close", this._handleCloseEvent.bind(this));
    }

    _handleDataEvent(data: any) {
        const { Header, CPF, Commands } = EthernetIP.encapsulation;

        const encapsulatedData = Header.parse(data);
        const { statusCode, status, commandCode } = encapsulatedData;

        if (statusCode !== 0) {
            console.log(`Error <${statusCode}>:`, status);

            this.state.error.code = statusCode;
            this.state.error.msg = status;

            this.controller.emit("Session Registration Failed", this.state.error);
        } else {

            this.state.error.code = 0;
            this.state.error.msg = "";

            /* eslint-disable indent */
            switch (commandCode) {
                case Commands.REGISTER_SESSION:
                    this.state.session.establishing = false;
                    this.state.session.established = true;
                    this.state.session.id = encapsulatedData.session;
                    this.controller.emit("Session Registered", this.state.session.id);
                    break;

                case Commands.UNREGISTER_SESSION:
                    this.state.session.established = false;
                    this.controller.emit("Session Unregistered");
                    break;

                case Commands.SEND_RR_DATA: {
                    let buf1 = Buffer.alloc(encapsulatedData.length - 6); // length of Data - Interface Handle <UDINT> and Timeout <UINT>
                    encapsulatedData.data.copy(buf1, 0, 6);

                    const srrd = CPF.parse(buf1);
                    this.controller.emit("SendRRData Received", srrd);
                    break;
                }
                case Commands.SEND_UNIT_DATA: {
                    let buf2 = Buffer.alloc(encapsulatedData.length - 6); // length of Data - Interface Handle <UDINT> and Timeout <UINT>
                    encapsulatedData.data.copy(buf2, 0, 6);

                    const sud = CPF.parse(buf2);
                    this.controller.emit("SendUnitData Received", sud);
                    break;
                }
                default:
                    this.controller.emit("Unhandled Encapsulated Command Received", encapsulatedData);
            }
            /* eslint-enable indent */
        }
    }

    /**
     * Socket.on('close',...) Event Handler
     *
     * @param {Boolean} hadError
     * @memberof ENIP
     */
    _handleCloseEvent(hadError: any) {
        this.state.session.established = false;
        this.state.TCP.established = false;
    }
}