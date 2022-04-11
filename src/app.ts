import express,  { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { WebSocket, WebSocketServer } from "ws";
import { Server } from "http";
import { pinoHttp } from "pino-http";
import { pino } from "pino";

import QRCode from "qrcode";
import { PassThrough } from 'stream';

import { Machine } from "./Machine";
import { getIPAddress } from "./util";
import path from "path";
import fs from "fs";

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

    public machine?: Machine;

    public status: IStatus;

    constructor()
    {
        this.status = {
            mode: "starting",
            errors: []
        };

        if(process.env.NODE_ENV === "production")
        {
            if(!fs.existsSync(path.resolve("data", "logs")))
                fs.mkdirSync(path.resolve("data", "logs"), {recursive: true});
        }

        this.logger = pino({
            level: process.env.DISABLE_TRACE_LOG != "" ? "trace" : "info"
        }, process.env.NODE_ENV == "production" ? pino.destination(fs.createWriteStream(path.resolve("data", "logs", "nuster-tubine.log"), {autoClose: true})) : pino.destination(process.stdout));

        this.logger.info("Starting NusterTurbine");

        this.status.mode = "running";

        const infoPath = (process.env.NODE_ENV != 'production' || process.env.FORCE_DEV_CONFIG == 'true') ? path.resolve("data", "info.json") : "/data/info.json";

        if(fs.existsSync(infoPath))
        {
            this.machine = new Machine(this.logger);

            this._express();
            this._websocket();
            this._mongoose();
    
            this._machine();
        }
        else
        {
            this.logger.warn("Machine info file not found");
            this.status.mode = "waiting-config";
            this._expressConfig();
        }

        
    }
    private _expressConfig()
    {
        this.httpServer = this.app.listen(80, () => {
            this.logger.info("Express config server running on port 80");

            this.app.use(express.json());

            this.app.post("/config", (req: Request, res: Response) => {
                if(req.body)
                {
                    if(process.env.NODE_ENV != 'production')
                    {
                        fs.mkdirSync(path.resolve("data"), {recursive: true});
                        
                        fs.writeFileSync(path.resolve("data", "info.json"), JSON.stringify(req.body, null, 4));
                    }
                    else
                    {
                        //do not create /data folder, it should already be there because of context
                        fs.writeFileSync("/data/info.json", JSON.stringify(req.body, null, 4));
                    }

                    this.logger.info("Config written, restarting NusterTurbine.");
                    res.end();
                    process.exit(1);
                }
            });
        });
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
        this.app.use(cors());
        this.app.use(cookieParser());

        //authing middleware
        if(!process.env.DISABLE_AUTH && this.machine)
            this.app.use(this.machine.authManager.middleware.bind(this.machine.authManager));
        else
            this.logger.warn("Auth manager disabled");

        //logging middleware
        this.app.use(pinoHttp({
            logger: this.logger,

            serializers: {
                err: pino.stdSerializers.err,
                req: pino.stdSerializers.req,
                res: pino.stdSerializers.res
              }
        }));

        this.logger.info(`Will use ${this.machine?.assetsFolder} as the assets folder.`);

        if(this.machine)
            this.app.use("/assets", express.static(this.machine.assetsFolder));

        this.app.get("/status", (req: Request, res: Response) => res.json(this.status));
        this.app.get("/ws", async (req: Request, res: Response) => res.json(await this.machine?.socketData()));

        this.app.get('/qr', async (req, res) => {
            try
            {
                if(this.machine)
                {
                    const content = {
                        model: this.machine.model,
                        modelVariant: this.machine.variant,
                        modelRevision: this.machine.revision,
                        serial: this.machine.serial,
                        networkName: getIPAddress(),
                        dateBuilt: "disabled"
                    };
                    const qrStream = new PassThrough();
                    await QRCode.toFileStream(qrStream, JSON.stringify(content),
                                {
                                    type: 'png',
                                    width: 200,
                                    errorCorrectionLevel: 'H'
                                }
                            );
            
                    qrStream.pipe(res);
                }
                else
                {
                    res.status(500).send("Machine not ready");
                }
                  
            } 
            catch(err)
            {
                console.error('Failed to return content', err);
                res.status(500).send("Failed to return content");
            }
        });

        //Adding machine updatelocker middleware
        this.app.all("*", (_req: Request, _res: Response, next: NextFunction) => {
            this.machine?.updateLocker.temporaryLockUpdates(2 * 60 * 1000);
            next();
        });       
    }
    /**
     * Create websocket handlers
     */
    private _websocket()
    {
        this.wsServer = new WebSocketServer({server: this.httpServer, path: "/v1"}, () => { 
            this.logger.info("Websocket server listening on port 80");
        });

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
                if(this.machine)
                {
                    if(this.machine.WebSocketServer === undefined)
                        this.machine.WebSocketServer = this.wsServer;

                    const data = await this.machine.socketData();
    
                    for(const ws of this.wsServer.clients)
                    {
                        //check if the websocket is still open
                        if(ws.readyState === WebSocket.OPEN)
                        {
                            ws.send(JSON.stringify({
                                type: "status",
                                message: data
                            }));
                        }
                    }
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
        if(this.machine)
        {
            this.app.use('/v1/maintenance', this.machine.maintenanceController.router);
            this.app.use('/v1/io', this.machine.ioController.router);
            this.app.use('/v1/profiles', this.machine.profileController.router);
            this.app.use('/v1/slots', this.machine.slotController.router);
            this.app.use('/v1/manual', this.machine.manualmodeController.router);
            this.app.use('/v1/cycle', this.machine.cycleController.router);
            this.app.use('/v1/passives', this.machine.passiveController.router);
    
            this.app.use('/v1/auth', this.machine.authManager.router);
        }
        else
        {
            this.logger.error("No machine defined, cannot add routes.");
            throw new Error("No machine defined, cannot add routes.");
        }

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
    nt.logger.error("unhandledPromise");
    nt.logger.error(error);

    nt.status.mode = "errored";
    nt.status.errors.push(`${error}`);
});

/**
 * Handling SIGTERM Events
 */
process.on("SIGTERM", async () => {
    nt.logger.info("Shutdown detected");

    //Reseting io on shutdown
    if(nt.machine?.ioController)
    {
        for(const g of nt.machine.ioController.gates ?? [])
        {
            await g.write(nt.machine.ioController, g.default);
        }
    }
});