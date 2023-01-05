import cookieParser from "cookie-parser";
import cors from "cors";
import fs from "fs";
import lockFile from "lockfile";
import mongoose from "mongoose";
import path from "path";

import type { Configuration } from "@metalizzsas/nuster-typings";
import type { Request, Response } from "express";
import express from "express";
import type { Server } from "http";
import { pino } from "pino";
import { pinoHttp } from "pino-http";
import { AvailableMachineModels, Machine } from "./Machine";
import { TurbineEventLoop } from "./events";
import { WebsocketDispatcher } from "./websocket/WebsocketDispatcher";

/** Express app */
const ExpressApp = express();
/** Base http Server used by WebSocketServer */
let httpServer: Server;

/** Machine instance holding all the controllers */
let machine: Machine;

/** Http express & ws port */
const HTTP_PORT = 4080;

/** Is NusterTurbine running in production mode */
const productionEnabled = (process.env.NODE_ENV === "production");

/** Info.json file path */
const infoPath = productionEnabled ? "/data/info.json" : path.resolve("data", "info.json");

const logsFolderPath = productionEnabled ? "/data/logs/" : path.resolve("data", "logs");

if(!fs.existsSync(logsFolderPath))
    fs.mkdirSync(logsFolderPath);

const logFilePath = productionEnabled ? `/data/logs/log-${new Date().toISOString()}.log`: path.resolve("data", "logs", `log-${new Date().toISOString()}.log`);

/** Pino logger instance */
export const LoggerInstance = pino({
    level: "trace",
    transport: {
        targets: [
            { target: 'pino-pretty', level: productionEnabled ? "info" : "trace", options: { destination: 1}},
            { target: 'pino/file', level: "trace", options: { destination: logFilePath }}
        ]
    }
});

TurbineEventLoop.on("log", (level, message) => {
    switch(level)
    {
        case "error": LoggerInstance.error(message); break;
        case "fatal": LoggerInstance.fatal(message); break;
        case "warning": LoggerInstance.warn(message); break;
        case "info": LoggerInstance.info(message); break;
        case "trace":
        default: LoggerInstance.trace(message); break;
    }
});

LoggerInstance.info("Starting NusterTurbine");

if(fs.existsSync(infoPath))
{
    const rawConfiguration = fs.readFileSync(infoPath, {encoding: "utf-8"});
    const parsedConfiguration = JSON.parse(rawConfiguration) as Configuration;

    SetupExpress();
    SetupWebsocketServer();
    SetupMongoDB();

    if(productionEnabled == false)
    {
        LoggerInstance.warn("DEV: Sending configuration to simulation server.");
        fetch("http://localhost:4081/config", { method: "post", headers: {"Content-Type": "application/json"}, body: JSON.stringify(parsedConfiguration)});
    }

    machine = new Machine(parsedConfiguration);

    SetupMachine(); //Expose machine routers to Express
}
else
{
    LoggerInstance.warn("Machine: Info file not found");
    SetupExpress(true);
}

/** Update locking the Balena Supervisor */
lockFile.lock("/tmp/balena/updates.lock", (err) => {
    (err) ? LoggerInstance.error("Lock: Updates locking failed.", err) : LoggerInstance.info("Lock: Updates are now locked.");                
});

/**
 * Setup Express running server
 * @param configOnly if set to true, only add Configuration routes
 */
function SetupExpress(configOnly = false)
{
    httpServer = ExpressApp.listen(HTTP_PORT, () => { 
        LoggerInstance.info("Express: HTTP server listening on port " + HTTP_PORT); 
    });

    ExpressApp.use(express.json());
    ExpressApp.use(cors());
    ExpressApp.use(cookieParser());

    if(productionEnabled)
    {
        //logging middleware
        ExpressApp.use(pinoHttp({
            logger: LoggerInstance,
            serializers: {
                err: pino.stdSerializers.err,
                req: pino.stdSerializers.req,
                res: pino.stdSerializers.res
                }
        }));
    }


    ExpressApp.get("/config", (req: Request, res: Response) => {
        res.json(AvailableMachineModels);
    });

    ExpressApp.post("/config/password/:password", async (req: Request, res: Response) => {
        if(req.params.password)
        {
            res.status(req.params.password == "NusterMetalizz" ? 200 : 403).end();
        }
    });

    ExpressApp.get("/config/actual", (req: Request, res: Response) => {
        try
        {
            let result = "";
            if(!productionEnabled)
                result = fs.readFileSync(path.resolve("data", "info.json"), { encoding: "utf8"});
            else
                result = fs.readFileSync("/data/info.json", {encoding: "utf8"});

            res.json(JSON.parse(result));
        }
        catch(ex)
        {
            res.status(404).end()
        }
    });

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

    ExpressApp.get("/spec", (req: Request, res: Response) => {
        res.json(machine.specs);
    })

    if(configOnly)
        return;

    ExpressApp.get("/ws", async (_req, res: Response) => res.json(await machine?.socketData()));

    //Tell the balena Hypervisor to force the pending update.
    ExpressApp.get("/forceUpdate", async (_req, res: Response) => {
        const req = await fetch("http://127.0.0.1:48484/v1/update?apikey=" + process.env.BALENA_SUPERVISOR_API_KEY, {headers: {"Content-Type": "application/json"}, body: JSON.stringify({force: true}), method: 'POST'});

        if(req.status == 204)
            res.status(200).end();
        else
            res.status(req.status).end();
    }); 
    
    ExpressApp.get("/currentReleaseNotes", (_req, res: Response) => { res.sendFile(path.resolve("CHANGELOG.md")); });

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
    WebsocketDispatcher.getInstance(httpServer);

    setInterval(async () => {
        WebsocketDispatcher.getInstance().broadcastData(await machine.socketData(), "status");
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
}

/**
 * Add all machines routes to express
 */
function SetupMachine()
{
    if(machine)
    {
        WebsocketDispatcher.getInstance().connectPopup = machine.specs.nuster?.connectPopup;
        LoggerInstance.info("Machine: Setting up connect popup.");

        ExpressApp.use('/v1/io', machine.ioRouter.router);
        ExpressApp.use('/v1/profiles', machine.profileRouter.router);
        ExpressApp.use('/v1/maintenances', machine.maintenanceRouter.router);
        ExpressApp.use('/v1/containers', machine.containerRouter.router);
        ExpressApp.use('/v1/slots', machine.containerRouter.router); //TODO: Remove, compat with old desktop ui
        ExpressApp.use('/v1/cycle', machine.cycleRouter.router);
        //ExpressApp.use('/v1/auth', auth.router); //TODO: Fixme
        LoggerInstance.info("Express: Registered routers");

        ExpressApp.use("/assets", express.static(machine.assetsFolder));
        LoggerInstance.info(`Express: Will use ${machine.assetsFolder} as the assets folder.`);

        ExpressApp.get("/machine", (_, res: Response) => {
            res.json(machine.toJSON());
        });

    }
    else
        LoggerInstance.fatal("Express: No machine defined, cannot add routes.");
}

process.on("uncaughtException", (error: Error) => LoggerInstance.error("unCaughtException: " + error.stack));
process.on('unhandledRejection', (error: Error) => LoggerInstance.error("unhandledPromiseRejection: " + error.stack));

/**
 * Handling SIGTERM Events
 */
process.on("SIGTERM", async () => {
    LoggerInstance.info("Shutdown: SIGTERM detected.");
    TurbineEventLoop.emit("io.resetAll");
});