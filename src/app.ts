import express,  { Request, Response } from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { WebSocket, WebSocketServer } from "ws";
import { Server } from "http";
import dgram from "dgram";
import { pinoHttp } from "pino-http";
import { pino } from "pino";

import { Machine } from "./Machine";

interface IStatus
{
    mode: string;
    errors: string[];
}

class NusterTurbine
{
    public app = express();
    public httpServer?: Server;
    public wsServer?: WebSocketServer;

    public logger: pino.Logger;

    public machine: Machine;

    public status: IStatus;

    constructor()
    {
        this.status = {
            mode: "starting",
            errors: []
        };

        this.logger = pino({
            level: process.env.DISABLE_TRACE_LOG != "" ? "trace" : "info"
        });

        this.machine = new Machine(this.logger);

        this.logger.info("Starting NusterTurbine");

        this.status.mode = "running";

        this._express();
        this._discovery();
        this._websocket();
        this._mongoose();

        this._machine();
    }
    /**
     * Configure Express over network
     */
    private _express()
    {
        this.httpServer = this.app.listen(80, () => { 
            this.logger.info("Express server listening on port 80"); 
        });

        this.app.use(express.json());
        this.app.use(cookieParser());

        //authing middleware
        if(!process.env.DISABLE_AUTH)
            this.app.use(this.machine.authManager.middleware.bind(this.machine.authManager));

        //logging middleware
        this.app.use(pinoHttp({
            logger: this.logger,

            serializers: {
                err: pino.stdSerializers.err,
                req: pino.stdSerializers.req,
                res: pino.stdSerializers.res
              }
        }));

        this.machine.logger.info(`Will use ${this.machine.assetsFolder} as the assets folder.`);
        this.app.use("/assets", express.static(this.machine.assetsFolder));

        this.app.get("/status", (req: Request, res: Response) => res.json(this.status));
        this.app.get("/ws", async (req: Request, res: Response) => res.json(await this.machine.socketData()));
    }
    /**
     * Create UDP4 discovery service
     */
    private _discovery() 
    {
        const multicast_addr = "1.1.1.1";
        const port = 2222;

        const listener = dgram.createSocket({type: "udp4", reuseAddr: true});
        const sender = dgram.createSocket({type: "udp4", reuseAddr: true});

        listener.bind(port, multicast_addr, function(){
            listener.addMembership(multicast_addr);
            listener.setBroadcast(true);
        });

        setInterval(() => {

            const string = JSON.stringify(this.machine);
            const data = Buffer.from(string);

            sender.send(data, 0, data.length, port, multicast_addr);
        }, 1000);
        this.logger.info("Binded discovery protocol");
    }
    /**
     * Create websocket handlers
     */
    private _websocket()
    {
        this.wsServer = new WebSocketServer({server: this.httpServer }, () => { this.logger.info("Websocket server listening on port 80"); });

        this.wsServer.on('connection', (ws: WebSocket) => { 
            if(this.wsServer)
            {
                this.wsServer.clients.add(ws); 
                this.logger.trace("New websocket client");
    
                ws.on("close", () => {
                    this.logger.trace("Websocket client disconnected");
                });
            }
        });

        setInterval(async () => {
            if(this.wsServer !== undefined)
            {
                const data = await this.machine.socketData();

                for(const ws of this.wsServer.clients)
                {
                    //check if the websocket is still open
                    if(ws.readyState === WebSocket.OPEN)
                        ws.send(JSON.stringify(data));
                }
            }
        }, 500);
    }
    /**
     * Connect and configure mongoose
     */
    private _mongoose()
    {
        try
        {
            mongoose.connect('mongodb://localhost/nuster2');
        }
        catch(err)
        {
            this.logger.fatal(err);

            this.status.mode = "errored";
            this.status.errors.push("Failed to connect to mongoDB");
        }

        //move id to _id
        //remove __v
        mongoose.set('toJSON', {
            virtuals: true,
            transform: (doc: Record<string, unknown>, converted: Record<string, unknown>) => {
                delete converted._id;
                delete converted.__v;
            }
        });

        mongoose.set('toObject', {
            virtuals: true,
            transform: (doc: Record<string, unknown>, converted: Record<string, unknown>) => {
                delete converted._id;
                delete converted.__v;
            }
        });
    }
    /**
     * Add all machines routes to express
     */
    private _machine()
    {
        this.app.use('/v1/maintenance', this.machine.maintenanceController.router);
        this.app.use('/v1/io', this.machine.ioController.router);
        this.app.use('/v1/profiles', this.machine.profileController.router);
        this.app.use('/v1/slots', this.machine.slotController.router);
        this.app.use('/v1/manual', this.machine.manualmodeController.router);
        this.app.use('/v1/cycle', this.machine.cycleController.router);
        this.app.use('/v1/passives', this.machine.passiveController.router);

        this.app.use('/v1/auth', this.machine.authManager.router);

        this.app.get("/qr", (req: Request, res: Response) => {
            res.status(200).end();
        });

        this.logger.info("Registered express routes");
    }
}

const nt = new NusterTurbine();

process.on("uncaughtException", error => {
    nt.logger.error("unCaughtException");
    nt.logger.error(error);

    nt.status.mode = "errored";
    nt.status.errors.push(error.message);
});

process.on('unhandledRejection', error => {
    nt.logger.error("Unhandledpromise");
    nt.logger.error(error);

    nt.status.mode = "errored";
    nt.status.errors.push(`${error}`);
});