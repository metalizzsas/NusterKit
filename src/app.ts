import express,  { Request, Response } from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { WebSocket, WebSocketServer } from "ws";
import { Server } from "http";
import dgram from "dgram";
import { pinoHttp } from "pino-http";
import { pino } from "pino";

import { Machine } from "./Machine";

class NusterTurbine
{
    public app = express();
    public httpServer?: Server;
    public wsServer?: WebSocketServer;

    public logger: pino.Logger;

    public machine: Machine;

    constructor()
    {
        this.logger = pino({
            level: process.env.NODE_ENV != "production" ? "trace" : "info"
        });

        this.machine = new Machine(this.logger);

        this.logger.info("Starting NusterTurbine");

        this.machine.configureRouters();

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
        this.httpServer = this.app.listen(80, () => { this.logger.info("Express server listening on port 80"); });
        this.app.use(express.json());
        this.app.use(cookieParser());

        //authing middleware
        if(process.env.NODE_ENV == "production")
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
    }
    /**
     * Create UDP4 discovery service
     */
    private _discovery() 
    {
        const multicast_addr = "1.1.1.1",
            port = 2222;

        const listener = dgram.createSocket({type:"udp4", reuseAddr:true}),
            sender = dgram.createSocket({type:"udp4", reuseAddr:true});

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
        this.wsServer = new WebSocketServer({server: this.httpServer });

        this.wsServer.on('connection', (ws: WebSocket) => { 
            if(this.wsServer)
            {
                this.wsServer.clients.add(ws); 
                this.logger.info("New websocket client");
    
                ws.on("close", () => {
                    this.logger.info("Websocket client disconnected");
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
        mongoose.connect('mongodb://localhost/nuster2');

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

process.on("uncaughtException", (error: Error) => {
    nt.logger.fatal("unCaughtException");
    nt.logger.fatal(error);
    process.exit(1);
});

process.on('unhandledRejection', error => {
    nt.logger.fatal("Unhandledpromise");
    nt.logger.fatal(error);
    process.exit(2);
  });