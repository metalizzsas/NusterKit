import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../db";
import { TurbineEventLoop } from "../events";
import { CallToActionIdParamsSchema, ErrorResponseSchema } from "../schemas";

export async function call_to_action_routes(fastify: FastifyInstance) {
	const app = fastify.withTypeProvider<ZodTypeProvider>();

	// Ménage au démarrage. Volontairement non bloquant : Fastify exécute
	// l'enregistrement des plugins pendant `listen()`, donc une base lente au boot
	// faisait rejeter `listen()` et le process sortait sans avoir servi une seule
	// requête. Un reliquat de call-to-action ne justifie pas de refuser de démarrer.
	await prisma.callToAction.deleteMany({}).catch((err: unknown) => {
		TurbineEventLoop.emit("log", "warning", `CTA: startup cleanup skipped: ${(err as Error).message}`);
	});

	app.get(
		"/:id",
		{
			schema: {
				params: CallToActionIdParamsSchema,
				response: {
					200: z.string(),
					404: ErrorResponseSchema,
					500: ErrorResponseSchema,
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;

			const cta = await prisma.callToAction.findUnique({ where: { id } });

			if (cta === null) {
				return reply.status(404).send({ error: "Call to action not found" });
			}

			if (cta.api_endpoint !== null && cta.api_method) {
				const cta_request = await fetch(`http://localhost:${process.env.PORT}${cta.api_endpoint}`, {
					method: cta.api_method,
					body: cta.api_body ?? undefined,
				});

				if (!cta_request.ok || cta_request.status !== 200) {
					return reply.status(500).send({ error: "Call to action API request failed" });
				}
			}

			await prisma.callToAction.delete({ where: { id } });
			return reply.status(200).send(cta.ui_endpoint ?? "");
		},
	);
}
