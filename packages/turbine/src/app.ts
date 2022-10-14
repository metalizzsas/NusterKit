import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import lockFile from "lockfile";

import express,  { Request, Response } from "express";
import { Server } from "http";
import { pinoHttp } from "pino-http";
import { pino } from "pino";
import { Machine } from "./Machine";
import { IConfiguration } from "@metalizzsas/nuster-typings";
import { AuthManager } from "./auth/auth";
import { IOController } from "./controllers/io/IOController";
import { ProfileController } from "./controllers/profile/ProfilesController";
import { MaintenanceController } from "./controllers/maintenance/MaintenanceController";
import { SlotController } from "./controllers/slot/SlotController";
import { ManualModeController } from "./controllers/manual/ManualModeController";
import { CycleController } from "./controllers/cycle/CycleController";
import { PassiveController } from "./controllers/passives/PassiveController";
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

/** Pino logger instance */
export const LoggerInstance = pino({
    level: productionEnabled == true ? "info" : "trace",
    stream: process.stdout
});

LoggerInstance.info("Starting NusterTurbine");

if(fs.existsSync(infoPath))
{
    const rawConfiguration = fs.readFileSync(infoPath, {encoding: "utf-8"});
    const parsedConfiguration = JSON.parse(rawConfiguration) as IConfiguration;

    SetupExpress();
    SetupWebsocketServer();
    SetupMongoDB();

    machine = new Machine(parsedConfiguration);

    SetupMachine(); //Expose machine routers to Express
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

    //logging middleware
    ExpressApp.use(pinoHttp({
        logger: LoggerInstance,
        serializers: {
            err: pino.stdSerializers.err,
            req: pino.stdSerializers.req,
            res: pino.stdSerializers.res
            }
    }));

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
        WebsocketDispatcher.getInstance().connectPopup = machine.specs.nuster?.connectPopup;
        LoggerInstance.info("Machine: Setting up connect popup.");

        ExpressApp.use('/v1/io', IOController.getInstance().router);
        ExpressApp.use('/v1/profiles', ProfileController.getInstance().router);
        ExpressApp.use('/v1/maintenance', MaintenanceController.getInstance().router);
        ExpressApp.use('/v1/slots', SlotController.getInstance().router);
        ExpressApp.use('/v1/manual', ManualModeController.getInstance().router);
        ExpressApp.use('/v1/cycle', CycleController.getInstance().router);
        ExpressApp.use('/v1/passives', PassiveController.getInstance().router);
        ExpressApp.use('/v1/auth', AuthManager.getInstance().router);
        LoggerInstance.info("Express: Registered routers");

        ExpressApp.use("/assets", express.static(machine.assetsFolder));
        LoggerInstance.info(`Express: Will use ${machine.assetsFolder} as the assets folder.`);

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
    try
    {
        //Reseting io on shutdown
        for(const g of IOController.getInstance().gates)
            await g.write(g.default);
    }
    catch(ex: unknown)
    {
        LoggerInstance.warn("Shutdown: Failed to reset gates to default values, IOController is not defined");
    }
});