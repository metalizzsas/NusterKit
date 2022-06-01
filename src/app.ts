import express,  { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { WebSocket, WebSocketServer } from "ws";
import path from "path";
import fs from "fs";
import lockFile from "lockfile";
import { Server } from "http";
import { pinoHttp } from "pino-http";
import { pino } from "pino";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import packageInfo from "../package.json";

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
    public machine?: Machine;
    public status: IStatus;

    private HTTP_PORT = 4080;

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

        lockFile.lock("/tmp/balena/updates.lock", (err) => {
            (err) ? this.logger.error("Updates locking failed.", err) : this.logger.info("Updates are now locked.");                
        });

    }
    private _expressConfig()
    {
        this.httpServer = this.app.listen(this.HTTP_PORT, () => {
            this.logger.info("Express config server running on port " + this.HTTP_PORT);

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
        this.httpServer = this.app.listen(this.HTTP_PORT, () => { 
            this.logger.info("Express server listening on port " + this.HTTP_PORT); 
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

        if(this.machine)
        {
            this.logger.info(`Will use ${this.machine.assetsFolder} as the assets folder.`);
            this.app.use("/assets", express.static(this.machine.assetsFolder));
        }

        this.app.get("/status", (_req, res: Response) => res.json(this.status));
        this.app.get("/ws", async (_req, res: Response) => res.json(await this.machine?.socketData()));

        //Tell the balena Hypervisor to force the pending update.
        this.app.get("/forceUpdate", async (_req, res: Response) => {
            const req = await fetch("http://127.0.0.1:48484/v1/update?apikey=" + process.env.BALENA_SUPERVISOR_API_KEY, {headers: {"Content-Type": "application/json"}, body: JSON.stringify({force: true}), method: 'POST'});

            if(req.status == 204)
                res.status(200).end();
            else
                res.status(req.status).end();
        }); 
        
        this.app.get("/currentReleaseNotes", (_req, res: Response) => {
            try
            {
                const releaseNotes = fs.readFileSync(path.resolve("patch-notes", `${packageInfo.version}.md`), "utf8");
                res.send(releaseNotes);
            }
            catch(err)
            {
                res.send("Releases notes not available");
            }
        });

        if(process.env.NODE_ENV != "production")
        {
            this.app.all("/api/*", (req: Request, res: Response) => res.redirect(307, req.url.replace("/api", "")));
        }
    }
    /**
     * Create websocket handlers
     */
    private _websocket()
    {
        this.wsServer = new WebSocketServer({server: this.httpServer, path: (process.env.NODE_ENV == "production") ? '' : '/ws/'});

        this.wsServer.on("listening", () => {
            this.logger.info("Websocket server listening..");
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
            mongoose.connect('mongodb://127.0.0.1/nuster2');
            this.logger.info("Connected to mongodb");
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