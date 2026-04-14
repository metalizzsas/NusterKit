import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "../db";
import { CallToActionIdParamsSchema, ErrorResponseSchema } from "../schemas";
import { z } from "zod";

export async function callToActionRoutes(fastify: FastifyInstance) {
	const app = fastify.withTypeProvider<ZodTypeProvider>();

	// Clear old CTAs on startup
	await prisma.callToAction.deleteMany({});

	app.get("/:id", {
		schema: {
			params: CallToActionIdParamsSchema,
			response: {
				200: z.string(),
				404: ErrorResponseSchema,
				500: ErrorResponseSchema,
			},
		},
	}, async (request, reply) => {
		const { id } = request.params;

		const cta = await prisma.callToAction.findUnique({ where: { id } });

		if (cta === null) {
			return reply.status(404).send({ error: "Call to action not found" });
		}

		if (cta.api_endpoint !== null && cta.api_method) {
			const ctaRequest = await fetch(`http://localhost:${process.env.PORT}${cta.api_endpoint}`, {
				method: cta.api_method,
				body: cta.api_body ?? undefined
			});

			if (!ctaRequest.ok || ctaRequest.status !== 200) {
				return reply.status(500).send({ error: "Call to action API request failed" });
			}
		}

		await prisma.callToAction.delete({ where: { id } });
		return reply.status(200).send(cta.ui_endpoint ?? "");
	});
}
