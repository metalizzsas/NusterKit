import fastify_cookie from "@fastify/cookie";
import fastify_cors from "@fastify/cors";
import fastify_static from "@fastify/static";
import fastify_swagger from "@fastify/swagger";
import fastify_swagger_ui from "@fastify/swagger-ui";
import Ajv from "ajv";
import Fastify from "fastify";
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import fs from "fs";
import type { Server } from "http";
import lock_file from "lockfile";
import path from "path";
import { pino } from "pino";
import { TurbineEventLoop } from "./events";
import { Machine } from "./machine";
import { migrate } from "./migrate";
import {
	call_to_action_routes,
	container_routes,
	cycle_routes,
	io_routes,
	machine_routes,
	maintenance_routes,
	network_routes,
	profile_routes,
	system_routes,
} from "./routes";
import type { Configuration, MachineSpecs } from "./types";
import * as SpecsSchema from "./types/schemas/schema-specs.json";
import { GracefulShutdown } from "./utils/graceful-shutdown";
import { validate_env } from "./utils/validate-env";
import { WebsocketDispatcher } from "./websocket/websocket-dispatcher";

(async () => {
	// Fail fast if required env vars are missing
	validate_env();

	/** Http port */
	const HTTP_PORT = Number(process.env.PORT ?? 4080);
	/** Is NusterTurbine running in production mode */
	const production_enabled = process.env.NODE_ENV === "production";

	/** AJV for machine specs validation */
	const ajv = new Ajv();
	const validate_machine_specs = ajv.compile(SpecsSchema);

	/** Machine instance holding all the controllers */
	let machine: Machine | undefined;

	/** Graceful shutdown orchestrator */
	const shutdown = new GracefulShutdown();

	/** Websocket manager */
	let websocket_dispatcher: WebsocketDispatcher | undefined;

	/** File / Folders paths */
	const base_path = production_enabled ? "/data" : "data";
	const machines_path = production_enabled ? "/machines" : path.resolve("machines");

	const info_path = path.resolve(base_path, "info.json");
	const settings_path = path.resolve(base_path, "settings.json");
	const logs_folder_path = path.resolve(base_path, "logs");
	const log_file_path = path.resolve(base_path, "logs", `log-${new Date().toISOString()}.log`);
	const update_file = path.resolve(base_path, "updated");

	/** Do NusterKit has been updated */
	const was_updated = fs.existsSync(update_file);

	if (was_updated) fs.rmSync(update_file);

	if (!fs.existsSync(logs_folder_path)) fs.mkdirSync(logs_folder_path);
	if (!fs.existsSync(settings_path)) fs.writeFileSync(settings_path, JSON.stringify({ dark: 1, lang: "en" }), { encoding: "utf-8" });

	/** Pino logger instance */
	const LoggerInstance = pino({
		level: "trace",
		transport: {
			targets: [
				{ target: "pino-pretty", level: production_enabled ? "info" : "trace", options: { destination: 1, colorize: true } },
				{ target: "pino/file", level: "trace", options: { destination: log_file_path } },
			],
		},
	});

	TurbineEventLoop.on("log", (level, message) => {
		switch (level) {
			case "error":
				LoggerInstance.error(message);
				break;
			case "fatal":
				LoggerInstance.fatal(message);
				break;
			case "warning":
				LoggerInstance.warn(message);
				break;
			case "info":
				LoggerInstance.info(message);
				break;
			case "trace":
			default:
				LoggerInstance.trace(message);
				break;
		}
	});

	TurbineEventLoop.emit("log", "info", "Starting NusterTurbine");

	/** Update locking the Balena Supervisor */
	lock_file.lock("/tmp/balena/updates.lock", (err) => {
		err
			? TurbineEventLoop.emit("log", "error", `Lock: Updates locking failed. ${err}`)
			: TurbineEventLoop.emit("log", "info", "Lock: Updates are now locked.");
	});

	await migrate(base_path);

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
		try {
			done(null, JSON.parse(body as string));
		} catch (err) {
			done(err as Error, undefined);
		}
	});

	await app.register(fastify_cors);
	await app.register(fastify_cookie);

	// OpenAPI / Swagger
	await app.register(fastify_swagger, {
		openapi: {
			info: {
				title: "NusterKit Turbine API",
				description: "Machine control API for NusterKit industrial systems",
				version: "3.0.0",
			},
		},
		transform: jsonSchemaTransform,
	});
	await app.register(fastify_swagger_ui, { routePrefix: "/api-docs" });

	// Global error handler
	app.setErrorHandler((error, _request, reply) => {
		const err = error instanceof Error ? error : new Error(String(error));
		TurbineEventLoop.emit("log", "error", `Fastify: ${err.stack ?? err.message}`);
		if (!reply.sent) {
			reply.status(500).send({ error: "Internal server error" });
		}
	});

	// ============================================================
	// Route plugins
	// ============================================================

	app.register(machine_routes, { machines_path, production_enabled, soft_exit: SoftExit, get_machine: () => machine });
	app.register(system_routes, { update_file, settings_path, soft_exit: SoftExit });

	// ============================================================
	// SoftExit — delegates to GracefulShutdown orchestrator
	// ============================================================

	async function SoftExit() {
		if (machine?.cycle_router.program !== undefined) throw Error("Cannot exit NusterTurbine while a program is running.");

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

	function SetupWebsocketServer() {
		const http_server = app.server as Server;

		websocket_dispatcher = new WebsocketDispatcher(http_server);

		if (machine) {
			websocket_dispatcher.set_machine(machine);
		}
	}

	// ============================================================
	// Machine routes setup
	// ============================================================

	function SetupMachine() {
		if (machine) {
			if (machine.specs.nuster?.connectPopup) websocket_dispatcher?.add_connect_popup(machine.specs.nuster?.connectPopup);

			if (was_updated)
				websocket_dispatcher?.add_connect_popup({
					title: "nuster.toast-update",
					message: "nuster.toast-update-body",
					level: "info",
					payload: {
						version: "missigno",
					},
				});

			TurbineEventLoop.emit("log", "info", "Machine: Setting up connect popup.");

			// Register Fastify route plugins
			app.register(io_routes, { prefix: "/v1/io", gates: machine.io_router.gates });
			app.register(profile_routes, { prefix: "/v1/profiles", profiles_router: machine.profile_router });
			app.register(maintenance_routes, { prefix: "/v1/maintenances", tasks: machine.maintenance_router.tasks });
			app.register(container_routes, {
				prefix: "/v1/containers",
				containers: machine.container_router.containers,
				container_router: machine.container_router,
			});
			app.register(cycle_routes, {
				prefix: "/v1/cycle",
				cycleTypes: machine.specs.cycleTypes,
				cyclePremades: machine.specs.cyclePremades,
				service_registry: machine.services,
				state: {
					get program() {
						return machine?.cycle_router.program;
					},
					set program(v) {
						if (machine) machine.cycle_router.program = v;
					},
				},
			});
			app.register(call_to_action_routes, { prefix: "/v1/calltoaction" });

			// Network routes — always registered for OpenAPI spec completeness.
			// In dev mode network_router is undefined; handlers will return errors.
			app.register(network_routes, { prefix: "/network", network_router: (machine.network_router ?? {}) as never });

			// Static files
			app.register(fastify_static, {
				root: path.resolve(machines_path, machine.data.model, "static"),
				prefix: "/static/",
			});

			TurbineEventLoop.emit("log", "info", "Fastify: Registered routers");

			// /machine and /realtime are registered via machine_routes plugin
		} else TurbineEventLoop.emit("log", "fatal", "Fastify: No machine defined, cannot add routes.");
	}

	// ============================================================
	// Initialize machine and start server
	// ============================================================

	if (fs.existsSync(info_path) && fs.existsSync(machines_path)) {
		let parsed_configuration: Configuration;
		try {
			const raw_configuration = fs.readFileSync(info_path, { encoding: "utf-8" });
			parsed_configuration = JSON.parse(raw_configuration) as Configuration;
		} catch (ex) {
			const msg = `Startup: Failed to parse ${info_path}: ${(ex as Error).message}`;
			TurbineEventLoop.emit("log", "fatal", msg);
			throw new Error(msg);
		}

		const machines = fs.readdirSync(machines_path);

		if (!machines.includes(parsed_configuration.model) && !fs.existsSync(path.resolve(machines_path, parsed_configuration.model, "specs.json"))) {
			TurbineEventLoop.emit("log", "fatal", "Machine: Model not found in machines folder.");
			throw Error("Machine: Model not found in machines folder.");
		}

		let parsed_specs: MachineSpecs;
		try {
			const raw_specs = fs.readFileSync(path.resolve(machines_path, parsed_configuration.model, "specs.json"), { encoding: "utf-8" });
			parsed_specs = JSON.parse(raw_specs) as MachineSpecs;
		} catch (ex) {
			const msg = `Startup: Failed to parse specs.json for model "${parsed_configuration.model}": ${(ex as Error).message}`;
			TurbineEventLoop.emit("log", "fatal", msg);
			throw new Error(msg);
		}

		if (!validate_machine_specs(parsed_specs)) {
			TurbineEventLoop.emit("log", "fatal", "Machine: Specs.json is not valid.");
			throw Error("Machine: specs.json is not valid.");
		} else {
			// Send the configuration to the simulation server
			if (process.env.SIMULATION_URL) {
				TurbineEventLoop.emit("log", "warning", `DEV: Sending configuration to ${process.env.SIMULATION_URL} simulation server.`);
				fetch(`${process.env.SIMULATION_URL}/config`, {
					method: "post",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ configuration: parsed_configuration, specs: parsed_specs }),
				});
			}

			machine = new Machine(parsed_configuration, parsed_specs);

			// Register machine resources for graceful shutdown (reverse order of disposal)
			// 2. IO gates and handlers — disposed after IO scanner stops
			shutdown.register("io-handlers", () => {
				for (const gate of machine!.io_router.gates) {
					if ("dispose" in gate && typeof gate.dispose === "function") {
						gate.dispose();
					}
				}
				for (const handler of machine!.io_router.handlers) {
					if ("dispose" in handler && typeof handler.dispose === "function") {
						handler.dispose();
					}
				}
			});

			// 3. Machine hypervisor polling
			shutdown.register("machine-hypervisor", () => machine!.dispose());

			// 4. IO scanner
			shutdown.register("io-scanner", () => machine!.io_router.stop_io_scanner());

			// 5. Containers & regulations — disable regulations and dispose all listeners
			shutdown.register("containers", async () => {
				for (const container of machine!.container_router.containers) {
					for (const regulation of container.regulations ?? []) {
						await machine!.container_router.set_regulation_state(container.name, regulation.name, false);
					}
					container.dispose();
				}
			});

			// 6. IO reset — set all outputs to safe state
			shutdown.register("io-reset", async () => {
				await machine!.io_router.reset_all();
			});

			SetupMachine();
		}
	} else {
		TurbineEventLoop.emit("log", "warning", "Machine: Info file not found");
	}

	// Start the Fastify server
	await app.listen({ port: HTTP_PORT, host: "0.0.0.0" });
	TurbineEventLoop.emit("log", "info", `Fastify: HTTP server listening on port ${HTTP_PORT}`);

	// Setup WebSocket after server is listening (app.server is available)
	if (machine) {
		SetupWebsocketServer();

		// 7. WebSocket server
		shutdown.register("websocket", () => websocket_dispatcher?.dispose());
	}

	// 9. Fastify HTTP server (disposed last among runtime resources, before Prisma)
	shutdown.register("fastify", () => app.close());

	// Post-update service restart
	if (was_updated && production_enabled) {
		TurbineEventLoop.emit("log", "info", "Update: NusterTurbine has been updated, restarting proxy & wpe services.");

		try {
			await fetch(
				`${process.env.BALENA_SUPERVISOR_ADDRESS}/v2/applications/${process.env.BALENA_APP_ID}/restart-service?apikey=${process.env.BALENA_SUPERVISOR_API_KEY}`,
				{
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ serviceName: "proxy", force: true }),
					method: "POST",
				},
			);
		} catch (ex) {
			TurbineEventLoop.emit("log", "error", `Update: Failed to restart proxy service: ${(ex as Error).message}`);
		}

		try {
			await fetch(
				`${process.env.BALENA_SUPERVISOR_ADDRESS}/v2/applications/${process.env.BALENA_APP_ID}/restart-service?apikey=${process.env.BALENA_SUPERVISOR_API_KEY}`,
				{
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ serviceName: "wpe", force: true }),
					method: "POST",
				},
			);
		} catch (ex) {
			TurbineEventLoop.emit("log", "error", `Update: Failed to restart wpe service: ${(ex as Error).message}`);
		}

		TurbineEventLoop.emit("log", "info", "Update: Restarted proxy & wpe services.");

		lock_file.lock("/tmp/balena/updates.lock", (err) => {
			err
				? TurbineEventLoop.emit("log", "error", `Lock: Updates locking failed. ${err}`)
				: TurbineEventLoop.emit("log", "info", "Lock: Updates are now re-locked.");
		});
	}

	/** NodeJS process events */
	process.on("uncaughtException", (error: Error) => TurbineEventLoop.emit("log", "error", "unCaughtException: " + error.stack));
	process.on("unhandledRejection", (error: Error) => TurbineEventLoop.emit("log", "error", "unhandledPromiseRejection: " + error.stack));

	const handle_shutdown_signal = async (signal: string) => {
		TurbineEventLoop.emit("log", "info", `Shutdown: ${signal} detected.`);
		try {
			await SoftExit();
		} catch (err) {
			TurbineEventLoop.emit("log", "error", `Shutdown: Failed: ${(err as Error).message}`);
		}
		process.exit(0);
	};

	process.on("SIGTERM", () => handle_shutdown_signal("SIGTERM"));
	process.on("SIGINT", () => handle_shutdown_signal("SIGINT"));
})();
