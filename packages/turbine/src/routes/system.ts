import fs from "fs";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { SettingsSchema, ErrorResponseSchema } from "../schemas";
import { TurbineEventLoop } from "../events";
import { z } from "zod";

interface SystemRoutesOpts {
	updateFile: string;
	settingsPath: string;
	softExit: () => Promise<void>;
}

export async function systemRoutes(fastify: FastifyInstance, opts: SystemRoutesOpts) {
	const { updateFile, settingsPath, softExit } = opts;
	const app = fastify.withTypeProvider<ZodTypeProvider>();

	app.get("/forceUpdate", {
		schema: {
			response: {
				200: z.void(),
				500: ErrorResponseSchema,
			},
		},
	}, async (_request, reply) => {
		try
		{
			await softExit();
			fs.writeFileSync(updateFile, "");

			const req = await fetch(`${process.env.BALENA_SUPERVISOR_ADDRESS}/v1/update?apikey=${process.env.BALENA_SUPERVISOR_API_KEY}`, { headers: { "Content-Type": "application/json" }, body: JSON.stringify({force: true}), method: 'POST'});

			return reply.status(req.status === 204 ? 200 : 500).send();
		}
		catch(ex)
		{
			TurbineEventLoop.emit('log', 'error', `ForceUpdate: ${(ex as Error).message}`);
			return reply.status(500).send({ error: "Internal server error" });
		}
	});

	app.get("/reboot", {
		schema: {
			response: {
				200: z.void(),
				500: ErrorResponseSchema,
			},
		},
	}, async (_request, reply) => {
		try
		{
			const req = await fetch(`${process.env.BALENA_SUPERVISOR_ADDRESS}/v1/reboot?apikey=${process.env.BALENA_SUPERVISOR_API_KEY}`, { headers: { "Content-Type": "application/json" }, body: JSON.stringify({force: true}), method: 'POST'});

			if(req.status === 202)
			{
				try { await softExit(); }
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
				return reply.status(500).send({ error: "Reboot request rejected by supervisor" });
		}
		catch (ex)
		{
			TurbineEventLoop.emit('log', 'error', `Reboot: ${(ex as Error).message}`);
			return reply.status(500).send({ error: "Internal server error" });
		}
	});

	app.get("/shutdown", {
		schema: {
			response: {
				200: z.void(),
				500: ErrorResponseSchema,
			},
		},
	}, async (_request, reply) => {
		try
		{
			const req = await fetch(`${process.env.BALENA_SUPERVISOR_ADDRESS}/v1/shutdown?apikey=${process.env.BALENA_SUPERVISOR_API_KEY}`, { headers: { "Content-Type": "application/json" }, body: JSON.stringify({force: true}), method: 'POST'});

			if(req.status === 202)
			{
				try { await softExit(); }
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
				return reply.status(500).send({ error: "Shutdown request rejected by supervisor" });
		}
		catch (ex)
		{
			TurbineEventLoop.emit('log', 'error', `Shutdown: ${(ex as Error).message}`);
			return reply.status(500).send({ error: "Internal server error" });
		}
	});

	app.post("/settings", {
		schema: {
			body: SettingsSchema,
			response: {
				200: z.void(),
				400: ErrorResponseSchema,
				500: ErrorResponseSchema,
			},
		},
	}, async (request, reply) => {
		try
		{
			const parsed = SettingsSchema.safeParse(request.body);
			if (!parsed.success) {
				return reply.status(400).send({ error: "Invalid settings", details: parsed.error.flatten() } as never);
			}

			fs.writeFileSync(settingsPath, JSON.stringify(parsed.data));
			return reply.status(200).send();
		}
		catch(ex)
		{
			TurbineEventLoop.emit('log', 'error', `Settings: ${(ex as Error).message}`);
			return reply.status(500).send({ error: "Internal server error" });
		}
	});

	app.get("/settings", {
		schema: {
			response: {
				200: SettingsSchema,
				500: z.void(),
			},
		},
	}, async (_request, reply) => {
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
}
