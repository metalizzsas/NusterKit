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

    private productionEnabled = process.env.NODE_ENV == "production";

    constructor()
    {
        this.status = {
            mode: "starting",
            errors: []
        };

        //Base folder for logs
        const logFileFolder = this.productionEnabled ? '/data/logs' : path.resolve("data", "logs");

        //Check if base folder for logs exists if not create it
        if(!fs.existsSync(logFileFolder))
            fs.mkdirSync(logFileFolder, { recursive: true });

        
        //Log file name
        const logFileStream = this.productionEnabled ? `${logFileFolder}/logs-${Date.now()}.json` : path.resolve(logFileFolder, `logs-${Date.now()}.json`);

        //Streams used by pino
        const streams = [
            { stream: process.stdout },
            { stream: pino.destination(logFileStream) },
        ];

        this.logger = pino({
            level: this.productionEnabled == true ? "info" : "trace"
        }, pino.multistream(streams));

        this.logger.info("Starting NusterTurbine");

        const actualDate = Date.now();
        const logFiles = fs.readdirSync(logFileFolder);

        for(const logFile of logFiles)
        {
            const dateOfFile = logFile.split("-")[1];

            if(actualDate - (30 * 24 * 60 * 1000) > parseInt(dateOfFile))
            {
                fs.rmSync(path.resolve(logFileFolder, logFile))
                this.logger.warn("Removed " + logFile + " logfile because it is 30 days older than today.");
            }
        }

        this.status.mode = "running";

        const infoPath = this.productionEnabled ? "/data/info.json" : path.resolve("data", "info.json");

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
            this.logger.warn("Machine: Info file not found");
            this.status.mode = "waiting-config";
            this._expressConfig();
        }

        lockFile.lock("/tmp/balena/updates.lock", (err) => {
            (err) ? this.logger.error("Lock: Updates locking failed.", err) : this.logger.info("Lock: Updates are now locked.");                
        });
    }
    private _expressConfig()
    {
        this.httpServer = this.app.listen(this.HTTP_PORT, () => {
            this.logger.info("Express: Configuration HTTP server running on port " + this.HTTP_PORT);

            this.app.use(express.json());

            this.app.post("/config", (req: Request, res: Response) => {
                if(req.body)
                {
                    if(!this.productionEnabled)
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
            this.logger.info("Express: HTTP server listening on port " + this.HTTP_PORT); 
        });

        this.app.use(express.json());
        this.app.use(cors());
        this.app.use(cookieParser());

        //authing middleware
        if(!process.env.DISABLE_AUTH && this.machine)
            this.app.use(this.machine.authManager.middleware.bind(this.machine.authManager));
        else
            this.logger.warn("Auth: Express middleware disabled");

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
            this.logger.info(`Express: Will use ${this.machine.assetsFolder} as the assets folder.`);
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
                const releaseNotes = fs.readFileSync(path.resolve("release.md"), "utf8");
                res.send(releaseNotes);
            }
            catch(err)
            {
                res.send("Releases notes not available");
            }
        });

        if(!this.productionEnabled)
        {
            this.app.all("/api/*", (req: Request, res: Response) => res.redirect(307, req.url.replace("/api", "")));
        }
    }
    /**
     * Create websocket handlers
     */
    private _websocket()
    {
        this.wsServer = new WebSocketServer({server: this.httpServer, path: this.productionEnabled ? '' : '/ws/'});

        this.wsServer.on("listening", () => {
            this.logger.info("Websocket: Server listening..");
        });

        this.wsServer.on('connection', (ws: WebSocket) => { 
            if(this.wsServer)
            {
                this.wsServer.clients.add(ws); 
                this.logger.trace("Websocket: New client");
    
                ws.on("close", () => {
                    this.logger.trace("Websocket: Client disconnected");
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
            this.logger.info("Mongo: Connected to database");
        }
        catch(err)
        {
            this.logger.fatal(err);

            this.status.mode = "errored";
            this.status.errors.push("Mongo: Failed to connect to database");
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

        this.logger.info("Express: Registered routers");
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

    if(nt.wsServer)
    {
        for(const ws of nt.wsServer.clients)
        {
            ws.send(JSON.stringify({
                type: "close",
                message: "dispatch-close-event"
            }));
            ws.close();
        }
    }
});