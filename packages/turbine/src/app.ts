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
import { Machine } from "./Machine";
import { TurbineEventLoop } from "./events";
import { WebsocketDispatcher } from "./websocket/WebsocketDispatcher";

/** Http express & ws port */
const HTTP_PORT = 4080;
/** Is NusterTurbine running in production mode */
const productionEnabled = (process.env.NODE_ENV === "production");

/** Express app */
const ExpressApp = express();
/** Base http Server used by WebSocketServer */
let httpServer: Server | undefined = undefined;
/** Machine instance holding all the controllers */
let machine: Machine | undefined = undefined;

/** Websocket manager */
let websocketDispatcher: WebsocketDispatcher | undefined = undefined;

/** File / Folders paths */
const basePath = productionEnabled ? "/data" : "data";
const infoPath = path.resolve(basePath, "info.json");
const settingsPath = path.resolve(basePath, "settings.json");
const logsFolderPath = path.resolve(basePath, "logs");
const logFilePath = path.resolve(basePath, "logs", `log-${new Date().toISOString()}.log`);
const updateFile = path.resolve(basePath, "updated");

/** Do NusterKit has been updated */
const wasUpdated = fs.existsSync(updateFile);

if(wasUpdated) fs.rmSync(updateFile);

if(!fs.existsSync(logsFolderPath)) fs.mkdirSync(logsFolderPath);
if(!fs.existsSync(settingsPath)) fs.writeFileSync(settingsPath, JSON.stringify({ dark: 1, lang: "en" }), { encoding: "utf-8" });

/** Pino logger instance */
export const LoggerInstance = pino({
    level: "trace",
    transport: {
        targets: [
            { target: 'pino-pretty', level: productionEnabled ? "info" : "trace", options: { destination: 1, colorize: true }},
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

SetupExpress();

if(fs.existsSync(infoPath))
{
    const rawConfiguration = fs.readFileSync(infoPath, {encoding: "utf-8"});
    const parsedConfiguration = JSON.parse(rawConfiguration) as Configuration;

    SetupWebsocketServer();
    SetupMongoDB();

    if(productionEnabled == false)
    {
        LoggerInstance.warn("DEV: Sending configuration to simulation server.");
        fetch("http://localhost:4082/config", { method: "post", headers: {"Content-Type": "application/json"}, body: JSON.stringify(parsedConfiguration)});
    }

    machine = new Machine(parsedConfiguration);

    SetupMachine();
}
else
    LoggerInstance.warn("Machine: Info file not found");

/** Update locking the Balena Supervisor */
lockFile.lock("/tmp/balena/updates.lock", (err) => {
    (err) ? LoggerInstance.error("Lock: Updates locking failed.", err) : LoggerInstance.info("Lock: Updates are now locked.");                
});

if(wasUpdated && productionEnabled)
{
    LoggerInstance.info("Update: NusterTurbine has been updated, restarting proxy & wpe services.");
    Promise.all([
        fetch(`${process.env.BALENA_SUPERVISOR_ADDRESS}/v2/applications/${process.env.BALENA_APP_ID}/restart-service?apikey=${process.env.BALENA_SUPERVISOR_API_KEY}`, { 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ serviceName: "proxy", force: true }), 
            method: 'POST'}
        ),
    
        fetch(`${process.env.BALENA_SUPERVISOR_ADDRESS}/v2/applications/${process.env.BALENA_APP_ID}/restart-service?apikey=${process.env.BALENA_SUPERVISOR_API_KEY}`, { 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ serviceName: "wpe", force: true }), 
            method: 'POST'}
        )
    ]).then(() => {
        LoggerInstance.info("Update: Restarted proxy & wpe services.");
    });
}

/** Setup Express running server */
function SetupExpress()
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
                fs.mkdirSync(path.resolve("data"), { recursive: true });
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

    //Tell the balena Hypervisor to force the pending update.
    ExpressApp.get("/forceUpdate", async (_req, res: Response) => {

        /** On update, reset all io gates */
        try
        {
            await SoftExit();
            fs.writeFileSync(updateFile, "");
        }
        catch(ex)
        {
            TurbineEventLoop.emit('log', 'error', (ex as Error).message);
            return;
        }

        const req = await fetch(`${process.env.BALENA_SUPERVISOR_ADDRESS}/v1/update?apikey=${process.env.BALENA_SUPERVISOR_API_KEY}`, { headers: { "Content-Type": "application/json" }, body: JSON.stringify({force: true}), method: 'POST'});

        if(req.status == 204)
            res.status(200).end();
        else
            res.status(req.status).end();

    }); 

    ExpressApp.get("/reboot", async (_req, res: Response) => {

        try
        {
            const req = await fetch(`${process.env.BALENA_SUPERVISOR_ADDRESS}/v1/reboot?apikey=${process.env.BALENA_SUPERVISOR_API_KEY}`, { headers: { "Content-Type": "application/json" }, body: JSON.stringify({force: true}), method: 'POST'});
    
            if(req.status == 202)
            {
                /** On reboot, reset all io gates */
                try
                {
                    await SoftExit();
                }
                catch(ex)
                {
                    TurbineEventLoop.emit('log', 'error', (ex as Error).message);
                    return;
                }

                TurbineEventLoop.emit(`nuster.modal`, {
                    title: "settings.power.modal.reboot.title",
                    message: "settings.power.modal.reboot.message",
                    level: "info"
                });
                res.status(200).end();
            }
            else
                res.status(req.status).end();

        }
        catch(ex)
        {
            res.status(500).end();
        }

    });

    ExpressApp.get("/shutdown", async (_req, res: Response) => {

        try
        {
            const req = await fetch(`${process.env.BALENA_SUPERVISOR_ADDRESS}/v1/shutdown?apikey=${process.env.BALENA_SUPERVISOR_API_KEY}`, { headers: { "Content-Type": "application/json" }, body: JSON.stringify({force: true}), method: 'POST'});

            if(req.status == 202)
            {
                /** On shutdown, reset all io gates */

                try
                {
                    await SoftExit();
                }
                catch(ex)
                {
                    TurbineEventLoop.emit('log', 'error', (ex as Error).message);
                    return;
                }

                TurbineEventLoop.emit(`nuster.modal`, {
                    title: "settings.power.modal.shutdown.title",
                    message: "settings.power.modal.shutdown.message",
                    level: "info"
                });
                res.status(200).end();
            }
            else
                res.status(req.status).end();
        }
        catch(ex)
        {
            res.status(500).end();
        }
    });

    ExpressApp.post("/settings", async (req, res) => {
        try
        {
            if(req.body.theme !== undefined && req.body.lang !== undefined)
                throw Error("Settings not complete");
            
            fs.writeFileSync(settingsPath, JSON.stringify(req.body));
            res.status(200).end();
        }
        catch(ex)
        {
            res.status(500).end(String(ex));
        }
    });

    ExpressApp.get("/settings",async (_req, res) => {
        try
        {
            const data = fs.readFileSync(settingsPath, { encoding: "utf-8" });
            const settings = JSON.parse(data);
            res.status(200).json(settings);
        }
        catch(ex)
        {
            res.status(500).end();
        }
    });
}

/**
 * Gently exit the nuster turbine program
 * @throws
 */
async function SoftExit()
{

    if(machine?.cycleRouter.program !== undefined)
        throw Error("Cannot exit NusterTurbine while a program is running.");

    for(const container of machine?.containerRouter.containers.filter(c => (c.regulations?.length  ?? 0 )> 0) ?? [])
    {
        for(const regulation of container.regulations ?? [])
        {
            await new Promise<void>((resolve) => {
                TurbineEventLoop.emit(`container.${container.name}.regulation.${regulation.name}.set_state`, { state: false, callback: () => resolve()})
            });
        }
    }

    TurbineEventLoop.emit('io.resetAll');
}

/** Setup Websocket server */
function SetupWebsocketServer()
{
    if(httpServer === undefined)
    {
        LoggerInstance.error("Websocket: Cannot setup websocket server, httpServer is undefined.");
        throw Error("Cannot setup websocket server, httpServer is undefined.");
    }

    websocketDispatcher = new WebsocketDispatcher(httpServer);

    setInterval(async () => {
        websocketDispatcher?.broadcastData(await machine?.socketData(), "status");
    }, 500);
}

/** Connect and configure mongoose */
function SetupMongoDB()
{
    try
    {
        mongoose.connect(`mongodb://${process.env.MONGO_DB_URL ?? "127.0.0.1"}:27017/nuster2`);
        LoggerInstance.info("Mongo: Connected to database");
    }
    catch(err)
    {
        LoggerInstance.fatal("Mongo: Failed to connect to database");
        LoggerInstance.fatal(err);
        throw Error("Failed to connect to mongoDB.");
    }
}

/**  Add all machines routes to express */
function SetupMachine()
{
    if(machine)
    {
        if(machine.specs.nuster?.connectPopup)
            websocketDispatcher?.addConnectPopup(machine.specs.nuster?.connectPopup);

        if(wasUpdated)
            websocketDispatcher?.addConnectPopup({
                title: "nuster.toast-update",
                message: "nuster.toast-update-body",
                level: "info",
                payload: {
                    version: "missigno"
                }
        });
        
        LoggerInstance.info("Machine: Setting up connect popup.");

        ExpressApp.use('/v1/io', machine.ioRouter.router);
        ExpressApp.use('/v1/profiles', machine.profileRouter.router);
        ExpressApp.use('/v1/maintenances', machine.maintenanceRouter.router);
        ExpressApp.use('/v1/containers', machine.containerRouter.router);
        ExpressApp.use('/v1/cycle', machine.cycleRouter.router);
        ExpressApp.use('/network', machine.networkRouter.router);
        
        LoggerInstance.info("Express: Registered routers");

        ExpressApp.get("/machine", (_, res: Response) => { res.json(machine?.toJSON()); });
        
        /** Route for debug purposes */
        ExpressApp.get("/ws", async (_req, res: Response) => res.json(await machine?.socketData()));
    }
    else
        LoggerInstance.fatal("Express: No machine defined, cannot add routes.");
}

/** NodeJS process events */
process.on("uncaughtException", (error: Error) => LoggerInstance.error("unCaughtException: " + error.stack));
process.on('unhandledRejection', (error: Error) => LoggerInstance.error("unhandledPromiseRejection: " + error.stack));
process.on("SIGTERM", () => { LoggerInstance.info("Shutdown: SIGTERM detected."); SoftExit(); });