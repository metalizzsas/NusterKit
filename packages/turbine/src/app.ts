import fs from "fs";
import lockFile from "lockfile";
import path from "path";

import type { Configuration, MachineSpecs, MachineSpecsList } from "./types";
import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import fastifyStatic from "@fastify/static";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { serializerCompiler, validatorCompiler, jsonSchemaTransform } from "fastify-type-provider-zod";
import { pino } from "pino";
import { Machine } from "./Machine";
import { TurbineEventLoop } from "./events";
import { WebsocketDispatcher } from "./websocket/WebsocketDispatcher";
import * as SpecsSchema from "./types/schemas/schema-specs.json";
import { migrate } from "./migrate";
import Ajv from "ajv";
import { SettingsSchema, ConfigurationSchema } from "./schemas";
import { maintenanceRoutes, callToActionRoutes, ioRoutes, profileRoutes, containerRoutes, cycleRoutes, networkRoutes } from "./routes";
import type { Server } from "http";
import { validateEnv } from "./utils/validateEnv";
import { GracefulShutdown } from "./utils/GracefulShutdown";

(async () => {

    // Fail fast if required env vars are missing
    validateEnv();

    /** Http port */
    const HTTP_PORT = Number(process.env.PORT ?? 4080);
    /** Is NusterTurbine running in production mode */
    const productionEnabled = (process.env.NODE_ENV === "production");

    /** AJV for machine specs validation */
    const ajv = new Ajv();
    const validateMachineSpecs = ajv.compile(SpecsSchema);

    /** Machine instance holding all the controllers */
    let machine: Machine | undefined = undefined;

    /** Graceful shutdown orchestrator */
    const shutdown = new GracefulShutdown();

    /** Websocket manager */
    let websocketDispatcher: WebsocketDispatcher | undefined = undefined;
    let wsBroadcastInterval: ReturnType<typeof setInterval> | undefined = undefined;

    /** File / Folders paths */
    const basePath = productionEnabled ? "/data" : "data";
    const machinesPath = productionEnabled ? "/machines" : path.resolve("machines");

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
    const LoggerInstance = pino({
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
            case "error":  LoggerInstance.error(message); break;
            case "fatal":  LoggerInstance.fatal(message); break;
            case "warning":  LoggerInstance.warn(message); break;
            case "info":  LoggerInstance.info(message); break;
            case "trace":
            default:  LoggerInstance.trace(message); break;
        }
    });

    TurbineEventLoop.emit('log', 'info', "Starting NusterTurbine");

    /** Update locking the Balena Supervisor */
    lockFile.lock("/tmp/balena/updates.lock", (err) => {
        (err) ?  TurbineEventLoop.emit('log', 'error', `Lock: Updates locking failed. ${err}`) :  TurbineEventLoop.emit('log', 'info', "Lock: Updates are now locked.");
    });

    await migrate(basePath);

    // ============================================================
    // Fastify app setup
    // ============================================================

    const app = Fastify({
        // Fastify has built-in pino; we use our own logger instance via TurbineEventLoop
        logger: false,
    });

    // Zod validation compiler for typed route schemas
    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);

    await app.register(fastifyCors);
    await app.register(fastifyCookie);

    // OpenAPI / Swagger
    await app.register(fastifySwagger, {
        openapi: {
            info: {
                title: "NusterKit Turbine API",
                description: "Machine control API for NusterKit industrial systems",
                version: "3.0.0",
            },
        },
        transform: jsonSchemaTransform,
    });
    await app.register(fastifySwaggerUi, { routePrefix: "/api-docs" });

    // Global error handler
    app.setErrorHandler((error, _request, reply) => {
        const err = error instanceof Error ? error : new Error(String(error));
        TurbineEventLoop.emit('log', 'error', `Fastify: ${err.stack ?? err.message}`);
        if (!reply.sent) {
            reply.status(500).send({ error: "Internal server error" });
        }
    });

    // ============================================================
    // Standalone routes (not in routers)
    // ============================================================

    app.get("/configs", async (_request, reply) => {
        const machineSpecsList: MachineSpecsList = {};

        for(const modelFolder of fs.readdirSync(machinesPath).filter(mf => !mf.startsWith(".")))
        {
            const rawSpecs = fs.readFileSync(path.resolve(machinesPath, modelFolder, 'specs.json'), { encoding: "utf-8" });
            const parsedSpecs = JSON.parse(rawSpecs) as MachineSpecs;
            machineSpecsList[modelFolder] = parsedSpecs;
        }

        return machineSpecsList;
    });

    app.get("/config/actual", async (_request, reply) => {
        try
        {
            const configPath = productionEnabled ? "/data/info.json" : path.resolve("data", "info.json");
            const result = fs.readFileSync(configPath, { encoding: "utf8" });
            return JSON.parse(result);
        }
        catch
        {
            reply.status(404).send();
        }
    });

    app.post("/config", async (request, reply) => {
        const body = request.body;
        if(body)
        {
            const parsed = ConfigurationSchema.safeParse(body);
            if (!parsed.success) {
                return reply.status(400).send({ error: "Invalid configuration", details: parsed.error.flatten() });
            }

            if(!productionEnabled)
            {
                fs.mkdirSync(path.resolve("data"), { recursive: true });
                fs.writeFileSync(path.resolve("data", "info.json"), JSON.stringify(parsed.data, null, 4));
            }
            else
            {
                fs.writeFileSync("/data/info.json", JSON.stringify(parsed.data, null, 4));
            }

            TurbineEventLoop.emit('log', 'info', "Config written, restarting NusterTurbine.");
            reply.send();
            process.exit(1);
        }
    });

    app.get("/forceUpdate", async (_request, reply) => {
        try
        {
            await SoftExit();
            fs.writeFileSync(updateFile, "");
        }
        catch(ex)
        {
            TurbineEventLoop.emit('log', 'error', (ex as Error).message);
            return reply.status(500).send({ error: (ex as Error).message });
        }

        const req = await fetch(`${process.env.BALENA_SUPERVISOR_ADDRESS}/v1/update?apikey=${process.env.BALENA_SUPERVISOR_API_KEY}`, { headers: { "Content-Type": "application/json" }, body: JSON.stringify({force: true}), method: 'POST'});

        return reply.status(req.status === 204 ? 200 : req.status).send();
    });

    app.get("/reboot", async (_request, reply) => {
        try
        {
            const req = await fetch(`${process.env.BALENA_SUPERVISOR_ADDRESS}/v1/reboot?apikey=${process.env.BALENA_SUPERVISOR_API_KEY}`, { headers: { "Content-Type": "application/json" }, body: JSON.stringify({force: true}), method: 'POST'});

            if(req.status === 202)
            {
                try { await SoftExit(); }
                catch(ex) {
                    TurbineEventLoop.emit('log', 'error', (ex as Error).message);
                    return reply.status(500).send({ error: (ex as Error).message });
                }

                TurbineEventLoop.emit(`nuster.modal`, {
                    title: "settings.power.modal.reboot.title",
                    message: "settings.power.modal.reboot.message",
                    level: "info"
                });
                return reply.status(200).send();
            }
            else
                return reply.status(req.status).send();
        }
        catch
        {
            return reply.status(500).send();
        }
    });

    app.get("/shutdown", async (_request, reply) => {
        try
        {
            const req = await fetch(`${process.env.BALENA_SUPERVISOR_ADDRESS}/v1/shutdown?apikey=${process.env.BALENA_SUPERVISOR_API_KEY}`, { headers: { "Content-Type": "application/json" }, body: JSON.stringify({force: true}), method: 'POST'});

            if(req.status === 202)
            {
                try { await SoftExit(); }
                catch(ex) {
                    TurbineEventLoop.emit('log', 'error', (ex as Error).message);
                    return reply.status(500).send({ error: (ex as Error).message });
                }

                TurbineEventLoop.emit(`nuster.modal`, {
                    title: "settings.power.modal.shutdown.title",
                    message: "settings.power.modal.shutdown.message",
                    level: "info"
                });
                return reply.status(200).send();
            }
            else
                return reply.status(req.status).send();
        }
        catch
        {
            return reply.status(500).send();
        }
    });

    app.post("/settings", async (request, reply) => {
        try
        {
            const parsed = SettingsSchema.safeParse(request.body);
            if (!parsed.success) {
                return reply.status(400).send({ error: "Invalid settings", details: parsed.error.flatten() });
            }

            fs.writeFileSync(settingsPath, JSON.stringify(parsed.data));
            return reply.status(200).send();
        }
        catch(ex)
        {
            return reply.status(500).send({ error: String(ex) });
        }
    });

    app.get("/settings", async (_request, reply) => {
        try
        {
            const data = fs.readFileSync(settingsPath, { encoding: "utf-8" });
            return JSON.parse(data);
        }
        catch
        {
            return reply.status(500).send();
        }
    });

    // ============================================================
    // SoftExit — delegates to GracefulShutdown orchestrator
    // ============================================================

    async function SoftExit()
    {
        if(machine?.cycleRouter.program !== undefined)
            throw Error("Cannot exit NusterTurbine while a program is running.");

        await shutdown.shutdown();
    }

    // Register resources in creation order — they will be disposed in REVERSE order.
    // Resources registered later (closer to "ready") are disposed first.

    // 1. Prisma (registered early — disposed last)
    shutdown.register("prisma", async () => {
        const { prisma } = await import("./db.js");
        await prisma.$disconnect();
    });

    // Machine-dependent resources are registered after machine creation (see below)

    // ============================================================
    // WebSocket setup
    // ============================================================

    function SetupWebsocketServer()
    {
        const httpServer = app.server as Server;

        websocketDispatcher = new WebsocketDispatcher(httpServer);

        wsBroadcastInterval = setInterval(async () => {
            if(machine !== undefined && websocketDispatcher !== undefined)
                websocketDispatcher.broadcastData(await machine.socketData(), "status");
        }, 500);
    }

    // ============================================================
    // Machine routes setup
    // ============================================================

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

            TurbineEventLoop.emit('log', 'info', "Machine: Setting up connect popup.");

            // Register Fastify route plugins
            app.register(ioRoutes, { prefix: '/v1/io', gates: machine.ioRouter.gates });
            app.register(profileRoutes, { prefix: '/v1/profiles', profilesRouter: machine.profileRouter });
            app.register(maintenanceRoutes, { prefix: '/v1/maintenances', tasks: machine.maintenanceRouter.tasks });
            app.register(containerRoutes, { prefix: '/v1/containers', containers: machine.containerRouter.containers, services: machine.services });
            app.register(cycleRoutes, { prefix: '/v1/cycle', cycleTypes: machine.specs.cycleTypes, cyclePremades: machine.specs.cyclePremades, serviceRegistry: machine.services, state: { get program() { return machine?.cycleRouter.program; }, set program(v) { if (machine) machine.cycleRouter.program = v; } } });
            app.register(callToActionRoutes, { prefix: '/v1/calltoaction' });

            // Network routes only in production (D-Bus not available in dev)
            if (productionEnabled) {
                app.register(networkRoutes, { prefix: '/network', networkRouter: machine.networkRouter! });
            }

            // Static files
            app.register(fastifyStatic, {
                root: path.resolve(machinesPath, machine.data.model, 'static'),
                prefix: '/static/',
            });

            TurbineEventLoop.emit('log', 'info', "Fastify: Registered routers");

            // Machine data routes
            app.get("/machine", async () => machine?.toJSON());
            app.get("/realtime", async () => await machine?.socketData());
        }
        else
            TurbineEventLoop.emit('log', 'fatal', "Fastify: No machine defined, cannot add routes.");
    }

    // ============================================================
    // Initialize machine and start server
    // ============================================================

    if(fs.existsSync(infoPath) && fs.existsSync(machinesPath))
    {
        const rawConfiguration = fs.readFileSync(infoPath, {encoding: "utf-8"});
        const parsedConfiguration = JSON.parse(rawConfiguration) as Configuration;

        const machines = fs.readdirSync(machinesPath);

        if(!machines.includes(parsedConfiguration.model) && !fs.existsSync(path.resolve(machinesPath, parsedConfiguration.model, 'specs.json')))
        {
            TurbineEventLoop.emit('log', 'fatal', "Machine: Model not found in machines folder.");
            throw Error("Machine: Model not found in machines folder.");
        }

        const rawSpecs = fs.readFileSync(path.resolve(machinesPath, parsedConfiguration.model, 'specs.json'), { encoding: "utf-8" });
        const parsedSpecs = JSON.parse(rawSpecs) as MachineSpecs;

        if(!validateMachineSpecs(parsedSpecs))
        {
            TurbineEventLoop.emit('log', 'fatal', "Machine: Specs.json is not valid.");
            throw Error("Machine: specs.json is not valid.");
        }
        else
        {
            // Send the configuration to the simulation server
            if(process.env.SIMULATION_URL)
            {
                TurbineEventLoop.emit('log', 'warning', `DEV: Sending configuration to ${process.env.SIMULATION_URL} simulation server.`);
                fetch(`${process.env.SIMULATION_URL}/config`, { method: "post", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ configuration: parsedConfiguration, specs: parsedSpecs })});
            }

            machine = new Machine(parsedConfiguration, parsedSpecs);

            // Register machine resources for graceful shutdown (reverse order of disposal)
            // 2. IO handlers (WAGO Modbus connections) — disposed after IO scanner stops
            shutdown.register("io-handlers", () => {
                for (const handler of machine!.ioRouter.handlers) {
                    if ("dispose" in handler && typeof handler.dispose === "function") {
                        handler.dispose();
                    }
                }
            });

            // 3. Machine hypervisor polling
            shutdown.register("machine-hypervisor", () => machine!.dispose());

            // 4. IO scanner
            shutdown.register("io-scanner", () => machine!.ioRouter.stopIOScanner());

            // 5. Regulations — disable and dispose
            shutdown.register("regulations", async () => {
                for (const container of machine!.containerRouter.containers.filter(c => (c.regulations?.length ?? 0) > 0)) {
                    for (const regulation of container.regulations ?? []) {
                        regulation.dispose();
                        if (machine!.services) {
                            await machine!.services.containers.setRegulationState(container.name, regulation.name, false);
                        }
                    }
                }
            });

            // 6. IO reset — set all outputs to safe state
            shutdown.register("io-reset", async () => {
                if (machine!.services) {
                    await machine!.services.io.resetAll();
                } else {
                    TurbineEventLoop.emit("io.resetAll");
                }
            });

            SetupMachine();
        }
    }
    else
    {
        TurbineEventLoop.emit('log', 'warning', "Machine: Info file not found");
    }

    // Start the Fastify server
    await app.listen({ port: HTTP_PORT, host: "0.0.0.0" });
    TurbineEventLoop.emit('log', 'info', `Fastify: HTTP server listening on port ${HTTP_PORT}`);

    // Setup WebSocket after server is listening (app.server is available)
    if (machine) {
        SetupWebsocketServer();

        // 7. WS broadcast interval (disposed first — closest to "ready")
        shutdown.register("ws-broadcast", () => {
            if (wsBroadcastInterval) {
                clearInterval(wsBroadcastInterval);
                wsBroadcastInterval = undefined;
            }
        });

        // 8. WebSocket server
        shutdown.register("websocket", () => websocketDispatcher?.dispose());
    }

    // 9. Fastify HTTP server (disposed last among runtime resources, before Prisma)
    shutdown.register("fastify", () => app.close());

    // Post-update service restart
    if(wasUpdated && productionEnabled)
    {
        TurbineEventLoop.emit('log', 'info', "Update: NusterTurbine has been updated, restarting proxy & wpe services.");

        await fetch(`${process.env.BALENA_SUPERVISOR_ADDRESS}/v2/applications/${process.env.BALENA_APP_ID}/restart-service?apikey=${process.env.BALENA_SUPERVISOR_API_KEY}`, {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ serviceName: "proxy", force: true }),
            method: 'POST'}
        );
        await fetch(`${process.env.BALENA_SUPERVISOR_ADDRESS}/v2/applications/${process.env.BALENA_APP_ID}/restart-service?apikey=${process.env.BALENA_SUPERVISOR_API_KEY}`, {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ serviceName: "wpe", force: true }),
            method: 'POST'}
        );

        TurbineEventLoop.emit('log', 'info', "Update: Restarted proxy & wpe services.");

        lockFile.lock("/tmp/balena/updates.lock", (err) => {
            (err) ?  TurbineEventLoop.emit('log', 'error', `Lock: Updates locking failed. ${err}`) :  TurbineEventLoop.emit('log', 'info', "Lock: Updates are now re-locked.");
        });
    }

    /** NodeJS process events */
    process.on("uncaughtException", (error: Error) =>  TurbineEventLoop.emit('log', 'error', "unCaughtException: " + error.stack));
    process.on('unhandledRejection', (error: Error) =>  TurbineEventLoop.emit('log', 'error', "unhandledPromiseRejection: " + error.stack));

    const handleShutdownSignal = async (signal: string) => {
        TurbineEventLoop.emit('log', 'info', `Shutdown: ${signal} detected.`);
        try {
            await SoftExit();
        } catch (err) {
            TurbineEventLoop.emit('log', 'error', `Shutdown: Failed: ${(err as Error).message}`);
        }
        process.exit(0);
    };

    process.on("SIGTERM", () => handleShutdownSignal("SIGTERM"));
    process.on("SIGINT", () => handleShutdownSignal("SIGINT"));

})();
