import express,  {NextFunction, Request, Response} from "express";
import mongoose from "mongoose";
import { WebSocket, WebSocketServer } from "ws";
import { IncomingMessage, Server } from "http";

import dgram from "dgram";

import { Machine } from "./classes/Machine";

class NTurbine
{
    //servers related vars
    public app = express();
    public httpServer?: Server;
    public wsServer?: WebSocketServer;

    public machine: Machine;

    constructor()
    {
        this.machine = new Machine();

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
        this.httpServer = this.app.listen(80, () => { console.log("Listening on 80"); });
        this.app.use(express.json());
    }
    /**
     * Create UDP4 discovery service
     */
    private _discovery() {}
    /**
     * Create websocket handlers
     */
    private _websocket()
    {
        this.wsServer = new WebSocketServer({server: this.httpServer });

        this.wsServer.on('connection', (ws: WebSocket, request: IncomingMessage) => { 
            this.wsServer!.clients.add(ws); 
            console.log("new client");

            ws.on("close", () => {
                console.log("client disconnected");
            });
        });

        setInterval(() => {
            if(this.wsServer !== undefined)
            {
                for(let ws of this.wsServer.clients)
                {
                    ws.send(JSON.stringify(this.machine.socketData), (err) => {
                        if(err !== undefined)
                            console.log(err);
                    });
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
            transform: (doc, converted) => {
                delete converted._id;
                delete converted.__v;
            }
        });

        mongoose.set('toObject', {
            virtuals: true,
            transform: (doc, converted) => {
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
        this.app.all("*", (req: Request, res: Response, next: NextFunction) => {
            console.log(req.method, ":", req.url);
            next();
        });
        this.app.use('/v1/maintenance', this.machine.maintenanceController!.router)
        this.app.use('/v1/io', this.machine.ioController!.router)
        this.app.use('/v1/profiles', this.machine.profileController!.router)
        this.app.use('/v1/slots', this.machine.slotController!.router)
        this.app.use('/v1/manual', this.machine.manualmodeController!.router)
        this.app.use('/v1/cycle', this.machine.cycleController!.router)

        this.app.get("/qr", (req: Request, res: Response) => {
            res.status(200).end();
        })
    }
}

new NTurbine();