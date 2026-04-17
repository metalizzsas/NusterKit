import fs from "fs";
import path from "path";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import type { MachineSpecs, MachineSpecsList } from "../types";
import type { Machine } from "../Machine";
import { ConfigurationSchema, MachineSpecsListSchema, MachineDataSchema, StatusSchema, ErrorResponseSchema } from "../schemas";
import { TurbineEventLoop } from "../events";
import { z } from "zod";

interface MachineRoutesOpts {
	machinesPath: string;
	productionEnabled: boolean;
	softExit: () => Promise<void>;
	getMachine: () => Machine | undefined;
}

export async function machineRoutes(fastify: FastifyInstance, opts: MachineRoutesOpts) {
	const { machinesPath, productionEnabled, softExit, getMachine } = opts;
	const app = fastify.withTypeProvider<ZodTypeProvider>();

	app.get("/machine", {
		schema: {
			response: { 200: MachineDataSchema },
		},
	}, async () => getMachine()?.toJSON());

	app.get("/realtime", {
		schema: {
			response: { 200: StatusSchema },
		},
	}, async () => await getMachine()?.socketData() as never);

	app.get("/configs", {
		schema: {
			response: {
				200: MachineSpecsListSchema,
			},
		},
	}, async () => {
		const machineSpecsList: MachineSpecsList = {};

		for(const modelFolder of fs.readdirSync(machinesPath).filter(mf => !mf.startsWith(".")))
		{
			try {
				const rawSpecs = fs.readFileSync(path.resolve(machinesPath, modelFolder, 'specs.json'), { encoding: "utf-8" });
				const parsedSpecs = JSON.parse(rawSpecs) as MachineSpecs;
				machineSpecsList[modelFolder] = parsedSpecs;
			} catch (ex) {
				TurbineEventLoop.emit('log', 'warning', `Configs: Failed to load specs for "${modelFolder}": ${(ex as Error).message}`);
			}
		}

		return machineSpecsList;
	});

	app.get("/config/actual", {
		schema: {
			response: {
				200: ConfigurationSchema,
				404: z.void(),
			},
		},
	}, async (_request, reply) => {
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

	app.post("/config", {
		schema: {
			body: ConfigurationSchema,
			response: {
				200: z.void(),
				400: ErrorResponseSchema,
			},
		},
	}, async (request, reply) => {
		const body = request.body;
		if(body)
		{
			const parsed = ConfigurationSchema.safeParse(body);
			if (!parsed.success) {
				return reply.status(400).send({ error: "Invalid configuration", details: parsed.error.flatten() } as never);
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
			setTimeout(async () => {
				try { await softExit(); }
				catch (ex) { TurbineEventLoop.emit('log', 'error', `Config restart: ${(ex as Error).message}`); }
				process.exit(0);
			}, 500);
		}
	});
}
