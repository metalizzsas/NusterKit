import fs from "fs";
import type { FastifyInstance } from "fastify";
import { SettingsSchema } from "../schemas";
import { TurbineEventLoop } from "../events";

interface SystemRoutesOpts {
	updateFile: string;
	settingsPath: string;
	softExit: () => Promise<void>;
}

export async function systemRoutes(fastify: FastifyInstance, opts: SystemRoutesOpts) {
	const { updateFile, settingsPath, softExit } = opts;

	fastify.get("/forceUpdate", async (_request, reply) => {
		try
		{
			await softExit();
			fs.writeFileSync(updateFile, "");

			const req = await fetch(`${process.env.BALENA_SUPERVISOR_ADDRESS}/v1/update?apikey=${process.env.BALENA_SUPERVISOR_API_KEY}`, { headers: { "Content-Type": "application/json" }, body: JSON.stringify({force: true}), method: 'POST'});

			return reply.status(req.status === 204 ? 200 : req.status).send();
		}
		catch(ex)
		{
			TurbineEventLoop.emit('log', 'error', `ForceUpdate: ${(ex as Error).message}`);
			return reply.status(500).send({ error: "Internal server error" });
		}
	});

	fastify.get("/reboot", async (_request, reply) => {
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
				return reply.status(req.status).send();
		}
		catch (ex)
		{
			TurbineEventLoop.emit('log', 'error', `Reboot: ${(ex as Error).message}`);
			return reply.status(500).send({ error: "Internal server error" });
		}
	});

	fastify.get("/shutdown", async (_request, reply) => {
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
				return reply.status(req.status).send();
		}
		catch (ex)
		{
			TurbineEventLoop.emit('log', 'error', `Shutdown: ${(ex as Error).message}`);
			return reply.status(500).send({ error: "Internal server error" });
		}
	});

	fastify.post("/settings", async (request, reply) => {
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
			TurbineEventLoop.emit('log', 'error', `Settings: ${(ex as Error).message}`);
			return reply.status(500).send({ error: "Internal server error" });
		}
	});

	fastify.get("/settings", async (_request, reply) => {
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
