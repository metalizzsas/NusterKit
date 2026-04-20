import fs from "fs";
import lockFile from "lockfile";
import path from "path";

import type { Configuration, MachineSpecs } from "./types";
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
import { maintenanceRoutes, callToActionRoutes, ioRoutes, profileRoutes, containerRoutes, cycleRoutes, networkRoutes, machineRoutes, systemRoutes } from "./routes";
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

    // Allow empty body with application/json content-type (e.g. cycle prepare without profile)
    app.addContentTypeParser("application/json", { parseAs: "string" }, (_req, body, done) => {
        if (!body || (body as string).length === 0) return done(null, undefined);
        try { done(null, JSON.parse(body as string)); }
        catch (err) { done(err as Error, undefined); }
    });

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
    // Route plugins
    // ============================================================

    app.register(machineRoutes, { machinesPath, productionEnabled, softExit: SoftExit, getMachine: () => machine });
    app.register(systemRoutes, { updateFile, settingsPath, softExit: SoftExit });

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

        if (machine) {
            websocketDispatcher.setMachine(machine);
        }
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
            app.register(containerRoutes, { prefix: '/v1/containers', containers: machine.containerRouter.containers, containerRouter: machine.containerRouter });
            app.register(cycleRoutes, { prefix: '/v1/cycle', cycleTypes: machine.specs.cycleTypes, cyclePremades: machine.specs.cyclePremades, serviceRegistry: machine.services, state: { get program() { return machine?.cycleRouter.program; }, set program(v) { if (machine) machine.cycleRouter.program = v; } } });
            app.register(callToActionRoutes, { prefix: '/v1/calltoaction' });

            // Network routes — always registered for OpenAPI spec completeness.
            // In dev mode networkRouter is undefined; handlers will return errors.
            app.register(networkRoutes, { prefix: '/network', networkRouter: (machine.networkRouter ?? {}) as never });

            // Static files
            app.register(fastifyStatic, {
                root: path.resolve(machinesPath, machine.data.model, 'static'),
                prefix: '/static/',
            });

            TurbineEventLoop.emit('log', 'info', "Fastify: Registered routers");

            // /machine and /realtime are registered via machineRoutes plugin
        }
        else
            TurbineEventLoop.emit('log', 'fatal', "Fastify: No machine defined, cannot add routes.");
    }

    // ============================================================
    // Initialize machine and start server
    // ============================================================

    if(fs.existsSync(infoPath) && fs.existsSync(machinesPath))
    {
        let parsedConfiguration: Configuration;
        try {
            const rawConfiguration = fs.readFileSync(infoPath, {encoding: "utf-8"});
            parsedConfiguration = JSON.parse(rawConfiguration) as Configuration;
        } catch (ex) {
            const msg = `Startup: Failed to parse ${infoPath}: ${(ex as Error).message}`;
            TurbineEventLoop.emit('log', 'fatal', msg);
            throw new Error(msg);
        }

        const machines = fs.readdirSync(machinesPath);

        if(!machines.includes(parsedConfiguration.model) && !fs.existsSync(path.resolve(machinesPath, parsedConfiguration.model, 'specs.json')))
        {
            TurbineEventLoop.emit('log', 'fatal', "Machine: Model not found in machines folder.");
            throw Error("Machine: Model not found in machines folder.");
        }

        let parsedSpecs: MachineSpecs;
        try {
            const rawSpecs = fs.readFileSync(path.resolve(machinesPath, parsedConfiguration.model, 'specs.json'), { encoding: "utf-8" });
            parsedSpecs = JSON.parse(rawSpecs) as MachineSpecs;
        } catch (ex) {
            const msg = `Startup: Failed to parse specs.json for model "${parsedConfiguration.model}": ${(ex as Error).message}`;
            TurbineEventLoop.emit('log', 'fatal', msg);
            throw new Error(msg);
        }

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
            // 2. IO gates and handlers — disposed after IO scanner stops
            shutdown.register("io-handlers", () => {
                for (const gate of machine!.ioRouter.gates) {
                    if ("dispose" in gate && typeof gate.dispose === "function") {
                        gate.dispose();
                    }
                }
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

            // 5. Containers & regulations — disable regulations and dispose all listeners
            shutdown.register("containers", async () => {
                for (const container of machine!.containerRouter.containers) {
                    for (const regulation of container.regulations ?? []) {
                        await machine!.containerRouter.setRegulationState(container.name, regulation.name, false);
                    }
                    container.dispose();
                }
            });

            // 6. IO reset — set all outputs to safe state
            shutdown.register("io-reset", async () => {
                await machine!.ioRouter.resetAll();
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

        // 7. WebSocket server
        shutdown.register("websocket", () => websocketDispatcher?.dispose());
    }

    // 9. Fastify HTTP server (disposed last among runtime resources, before Prisma)
    shutdown.register("fastify", () => app.close());

    // Post-update service restart
    if(wasUpdated && productionEnabled)
    {
        TurbineEventLoop.emit('log', 'info', "Update: NusterTurbine has been updated, restarting proxy & wpe services.");

        try {
            await fetch(`${process.env.BALENA_SUPERVISOR_ADDRESS}/v2/applications/${process.env.BALENA_APP_ID}/restart-service?apikey=${process.env.BALENA_SUPERVISOR_API_KEY}`, {
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ serviceName: "proxy", force: true }),
                method: 'POST'}
            );
        } catch (ex) {
            TurbineEventLoop.emit('log', 'error', `Update: Failed to restart proxy service: ${(ex as Error).message}`);
        }

        try {
            await fetch(`${process.env.BALENA_SUPERVISOR_ADDRESS}/v2/applications/${process.env.BALENA_APP_ID}/restart-service?apikey=${process.env.BALENA_SUPERVISOR_API_KEY}`, {
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ serviceName: "wpe", force: true }),
                method: 'POST'}
            );
        } catch (ex) {
            TurbineEventLoop.emit('log', 'error', `Update: Failed to restart wpe service: ${(ex as Error).message}`);
        }

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
