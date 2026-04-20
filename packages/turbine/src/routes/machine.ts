import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import fs from "fs";
import path from "path";
import { z } from "zod";
import { TurbineEventLoop } from "../events";
import type { Machine } from "../machine";
import { ConfigurationSchema, ErrorResponseSchema, MachineDataSchema, MachineSpecsListSchema, StatusSchema } from "../schemas";
import type { MachineSpecs, MachineSpecsList } from "../types";

interface MachineRoutesOpts {
	machines_path: string;
	production_enabled: boolean;
	soft_exit: () => Promise<void>;
	get_machine: () => Machine | undefined;
}

export async function machine_routes(fastify: FastifyInstance, opts: MachineRoutesOpts) {
	const { machines_path, production_enabled, soft_exit, get_machine } = opts;
	const app = fastify.withTypeProvider<ZodTypeProvider>();

	app.get(
		"/machine",
		{
			schema: {
				response: { 200: MachineDataSchema },
			},
		},
		async () => get_machine()?.toJSON(),
	);

	app.get(
		"/realtime",
		{
			schema: {
				response: { 200: StatusSchema },
			},
		},
		async () => (await get_machine()?.socket_data()) as never,
	);

	app.get(
		"/configs",
		{
			schema: {
				response: {
					200: MachineSpecsListSchema,
				},
			},
		},
		async () => {
			const machine_specs_list: MachineSpecsList = {};

			for (const model_folder of fs.readdirSync(machines_path).filter((mf) => !mf.startsWith("."))) {
				try {
					const raw_specs = fs.readFileSync(path.resolve(machines_path, model_folder, "specs.json"), { encoding: "utf-8" });
					const parsed_specs = JSON.parse(raw_specs) as MachineSpecs;
					machine_specs_list[model_folder] = parsed_specs;
				} catch (ex) {
					TurbineEventLoop.emit("log", "warning", `Configs: Failed to load specs for "${model_folder}": ${(ex as Error).message}`);
				}
			}

			return machine_specs_list;
		},
	);

	app.get(
		"/config/actual",
		{
			schema: {
				response: {
					200: ConfigurationSchema,
					404: z.void(),
				},
			},
		},
		async (_request, reply) => {
			try {
				const config_path = production_enabled ? "/data/info.json" : path.resolve("data", "info.json");
				const result = fs.readFileSync(config_path, { encoding: "utf8" });
				return JSON.parse(result);
			} catch {
				reply.status(404).send();
			}
		},
	);

	app.post(
		"/config",
		{
			schema: {
				body: ConfigurationSchema,
				response: {
					200: z.void(),
					400: ErrorResponseSchema,
				},
			},
		},
		async (request, reply) => {
			const body = request.body;
			if (body) {
				const parsed = ConfigurationSchema.safeParse(body);
				if (!parsed.success) {
					return reply.status(400).send({ error: "Invalid configuration", details: parsed.error.flatten() } as never);
				}

				if (!production_enabled) {
					fs.mkdirSync(path.resolve("data"), { recursive: true });
					fs.writeFileSync(path.resolve("data", "info.json"), JSON.stringify(parsed.data, null, 4));
				} else {
					fs.writeFileSync("/data/info.json", JSON.stringify(parsed.data, null, 4));
				}

				TurbineEventLoop.emit("log", "info", "Config written, restarting NusterTurbine.");
				reply.send();
				setTimeout(async () => {
					try {
						await soft_exit();
					} catch (ex) {
						TurbineEventLoop.emit("log", "error", `Config restart: ${(ex as Error).message}`);
					}
					process.exit(0);
				}, 500);
			}
		},
	);
}
