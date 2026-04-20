import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import type { NetworkRouter } from "../routers/network-router";
import { AccessPointSchema, ErrorResponseSchema, NetworkDeviceSchema, WifiConnectBodySchema } from "../schemas";

interface NetworkRoutesOpts {
	network_router: NetworkRouter;
}

export async function network_routes(fastify: FastifyInstance, opts: NetworkRoutesOpts) {
	const { network_router } = opts;
	const app = fastify.withTypeProvider<ZodTypeProvider>();

	app.get(
		"/wifi/list",
		{
			schema: {
				response: {
					200: z.array(AccessPointSchema),
					500: ErrorResponseSchema,
				},
			},
		},
		async (_request, reply) => {
			try {
				return await network_router.listWifiNetworks();
			} catch (ex) {
				return reply.status(500).send({ error: String(ex) });
			}
		},
	);

	app.post(
		"/wifi/connect",
		{
			schema: {
				body: WifiConnectBodySchema,
				response: {
					200: z.string(),
					400: ErrorResponseSchema,
					500: ErrorResponseSchema,
				},
			},
		},
		async (request, reply) => {
			try {
				const result = await network_router.connectToWifi(request.body.ssid, request.body.password);
				return reply.status(result ? 200 : 500).send("");
			} catch (e) {
				if (e instanceof Array && String(e.at(0)).includes("802-11-wireless-security.psk")) {
					return reply.status(400).send({ error: "settings.network.errors.wifi_invalid_password" });
				}
				return reply.status(500).send({ error: String(e) });
			}
		},
	);

	app.get(
		"/wifi/disconnect",
		{
			schema: {
				response: {
					200: z.string(),
					500: ErrorResponseSchema,
				},
			},
		},
		async (_request, reply) => {
			try {
				await network_router.disconnectFromWifi();
				return reply.status(200).send("");
			} catch (e) {
				return reply.status(500).send({ error: String(e) });
			}
		},
	);

	app.get(
		"/devices",
		{
			schema: {
				response: {
					200: z.array(NetworkDeviceSchema),
					500: ErrorResponseSchema,
				},
			},
		},
		async (_request, reply) => {
			try {
				return await network_router.getDevices();
			} catch (ex) {
				return reply.status(500).send({ error: String(ex) });
			}
		},
	);
}
