import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import lockFile from "lockfile";

import express,  { Request, Response } from "express";
import serveIndex from "serve-index";
import { WebSocket, WebSocketServer } from "ws";
import { Server } from "http";
import { pinoHttp } from "pino-http";
import { pino } from "pino";
import { Machine } from "./Machine";
import { IConfiguration } from "./interfaces/IConfiguration";
import { AuthManager } from "./auth/auth";
import { IOController } from "./controllers/io/IOController";

/** Express app */
const ExpressApp = express();
/** Base http Server used by WebSocketServer */
let httpServer: Server;
/** WebSocket Server */
let WebSocketServerInstance: WebSocketServer;

/** Machine instance holding all the controllers */
let machine: Machine;

/** Http express & ws port */
const HTTP_PORT = 4080;

/** Is NusterTurbine running in production mode */
const productionEnabled = (process.env.NODE_ENV === "production");

/** Displayed routine popups, Prevent popups aggressive spawning */
const displayedPopups: string[] = [];

/** Logs files base path */
const logsPath = productionEnabled ? '/data/logs' : path.resolve("data", "logs");

/** Info.json file path */
const infoPath = productionEnabled ? "/data/info.json" : path.resolve("data", "info.json");

//Check if base folder for logs exists if not create it
if(!fs.existsSync(logsPath))
    fs.mkdirSync(logsPath, { recursive: true });

/** Pino logger instance */
export const LoggerInstance = pino({
    level: productionEnabled == true ? "info" : "trace"
}, pino.multistream([
    { stream: process.stdout },
    { stream: pino.destination(productionEnabled ? `${logsPath}/logs-${Date.now()}.json` : path.resolve(logsPath, `logs-${Date.now()}.json`)) },
]));

LoggerInstance.info("Starting NusterTurbine");

const actualDate = Date.now();
const logFiles = fs.readdirSync(logsPath);

for(const logFile of logFiles)
{
    const dateOfFile = logFile.split("-")[1];

    if(actualDate - (30 * 24 * 60 * 1000) > parseInt(dateOfFile))
    {
        fs.rmSync(path.resolve(logsPath, logFile))
        LoggerInstance.warn("Removed " + logFile + " logfile because it is 30 days older than today.");
    }
}

if(fs.existsSync(infoPath))
{
    const infos = fs.readFileSync(infoPath, {encoding: "utf-8"});
    const parsed = JSON.parse(infos) as IConfiguration;

    machine = new Machine(parsed, LoggerInstance);

    SetupExpress();
    SetupWebsocketServer();
    SetupMongoDB();
    SetupMachine();
}
else
{
    LoggerInstance.warn("Machine: Info file not found");
    SetupExpressConfiguration();
}

/** Update locking the Balena Supervisor */
lockFile.lock("/tmp/balena/updates.lock", (err) => {
    (err) ? LoggerInstance.error("Lock: Updates locking failed.", err) : LoggerInstance.info("Lock: Updates are now locked.");                
});

/**
 * Setup Express configuration server
 */
function SetupExpressConfiguration()
{
    httpServer = ExpressApp.listen(HTTP_PORT, () => {
        LoggerInstance.info("Express: Configuration HTTP server running on port " + HTTP_PORT);

        ExpressApp.use(express.json());

        ExpressApp.post("/config", (req: Request, res: Response) => {
            if(req.body)
            {
                if(!productionEnabled)
                {
                    fs.mkdirSync(path.resolve("data"), {recursive: true});
                    fs.writeFileSync(path.resolve("data", "info.json"), JSON.stringify(req.body, null, 4));
                }
                else
                {
                    //do not create /data folder, it should already be there because of context
                    fs.writeFileSync("/data/info.json", JSON.stringify(req.body, null, 4));
                }

                LoggerInstance.info("Config written, restarting NusterTurbine.");
                res.end();
                process.exit(1);
            }
        });
    });
}
/**
 * Setup Express running server
 */
function SetupExpress()
{
    httpServer = ExpressApp.listen(HTTP_PORT, () => { 
        LoggerInstance.info("Express: HTTP server listening on port " + HTTP_PORT); 
    });

    ExpressApp.use(express.json());
    ExpressApp.use(cors());
    ExpressApp.use(cookieParser());

    //authing middleware
    if(!process.env.DISABLE_AUTH)
        ExpressApp.use(AuthManager.getInstance().middleware.bind(AuthManager.getInstance()));
    else
        LoggerInstance.warn("Auth: Express middleware disabled");

    //logging middleware
    ExpressApp.use(pinoHttp({
        logger: LoggerInstance,
        serializers: {
            err: pino.stdSerializers.err,
            req: pino.stdSerializers.req,
            res: pino.stdSerializers.res
            }
    }));

    /** Serve logs in this folder */
    LoggerInstance.info(`Express: Will use ${logsPath} as the logs folder.`);
    ExpressApp.use("/logs", express.static(logsPath), serveIndex(logsPath));

    ExpressApp.get("/ws", async (_req, res: Response) => res.json(await machine?.socketData()));

    //Tell the balena Hypervisor to force the pending update.
    ExpressApp.get("/forceUpdate", async (_req, res: Response) => {
        const req = await fetch("http://127.0.0.1:48484/v1/update?apikey=" + process.env.BALENA_SUPERVISOR_API_KEY, {headers: {"Content-Type": "application/json"}, body: JSON.stringify({force: true}), method: 'POST'});

        if(req.status == 204)
            res.status(200).end();
        else
            res.status(req.status).end();
    }); 
    
    ExpressApp.get("/currentReleaseNotes", (_req, res: Response) => {
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

    if(!productionEnabled)
    {
        ExpressApp.all("/api/*", (req: Request, res: Response) => res.redirect(307, req.url.replace("/api", "")));
    }
}
/**
 * Setup Websocket server
 */
function SetupWebsocketServer()
{
    WebSocketServerInstance = new WebSocketServer({server: httpServer, path: productionEnabled ? '' : '/ws/'});

    WebSocketServerInstance.on("listening", () => {
        LoggerInstance.info("Websocket: Server listening..");
    });

    WebSocketServerInstance.on('connection', (ws: WebSocket) => { 
        if(WebSocketServerInstance)
        {
            WebSocketServerInstance.clients.add(ws); 
            LoggerInstance.trace("Websocket: New client");

            if(machine?.specs.nuster?.connectPopup !== undefined && !displayedPopups.includes(machine.specs.nuster.connectPopup.identifier))
            {
                setTimeout(() => {
                    LoggerInstance.info("Websocket: Displaying connect popup.");

                    ws.send(JSON.stringify({
                        type: "popup",
                        message: machine?.specs.nuster?.connectPopup
                    }));

                    //displayedPopups.push(machine.specs.nuster.connectPopup.identifier); //TODO
                }, 2500);
            }

            ws.on("close", () => {
                LoggerInstance.trace("Websocket: Client disconnected");
            });
        }
    });

    setInterval(async () => {
        if(WebSocketServerInstance !== undefined)
        {
            if(machine)
            {
                if(machine.WebSocketServer === undefined)
                    machine.WebSocketServer = WebSocketServerInstance;

                const data = await machine.socketData();

                for(const ws of WebSocketServerInstance.clients)
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
function SetupMongoDB()
{
    try
    {
        mongoose.connect('mongodb://127.0.0.1/nuster2');
        LoggerInstance.info("Mongo: Connected to database");
    }
    catch(err)
    {
        LoggerInstance.fatal("Mongo: Failed to connect to database");
        LoggerInstance.fatal(err);
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
function SetupMachine()
{
    if(machine)
    {
        ExpressApp.use('/v1/maintenance', machine.maintenanceController.router);
        ExpressApp.use('/v1/io', IOController.getInstance().router);
        ExpressApp.use('/v1/profiles', machine.profileController.router);
        ExpressApp.use('/v1/slots', machine.slotController.router);
        ExpressApp.use('/v1/manual', machine.manualmodeController.router);
        ExpressApp.use('/v1/cycle', machine.cycleController.router);
        ExpressApp.use('/v1/passives', machine.passiveController.router);
        ExpressApp.use('/v1/auth', AuthManager.getInstance().router);
        LoggerInstance.info("Express: Registered routers");

        ExpressApp.use("/assets", express.static(machine.assetsFolder));
        LoggerInstance.info(`Express: Will use ${machine.assetsFolder} as the assets folder.`);

    }
    else
        LoggerInstance.fatal("Express: No machine defined, cannot add routes.");
}

process.on("uncaughtException", (error: Error) => LoggerInstance.error("unCaughtException: " + error.stack));
process.on('unhandledRejection', (error: Error) => LoggerInstance.error("unhandledPromise: " + error.stack));

/**
 * Handling SIGTERM Events
 */
process.on("SIGTERM", async () => {
    LoggerInstance.info("Shutdown detected");

    try
    {
        //Reseting io on shutdown
        for(const g of IOController.getInstance().gates)
        {
            await g.write(g.default);
        }
    }
    catch(ex: any)
    {
        LoggerInstance.warn("Shutdown: Failed to reset gates to default values, IOController is not defined");
    }

    if(WebSocketServerInstance)
    {
        for(const ws of WebSocketServerInstance.clients)
        {
            ws.send(JSON.stringify({
                type: "close",
                message: "dispatch-close-event"
            }));
            ws.close();
        }
    }
});