import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import type { IOGatesHydrated } from "$types/hydrated/io";
import { IOWriteParamsSchema, IOWriteQuerySchema, ErrorResponseSchema } from "../schemas";
import { z } from "zod";

interface IORoutesOpts {
	gates: IOGatesHydrated[];
}

export async function ioRoutes(fastify: FastifyInstance, opts: IORoutesOpts) {
	const { gates } = opts;
	const app = fastify.withTypeProvider<ZodTypeProvider>();

	app.post("/:name/:value", {
		schema: {
			params: IOWriteParamsSchema,
			querystring: IOWriteQuerySchema,
			response: {
				200: z.string(),
				403: ErrorResponseSchema,
				404: ErrorResponseSchema,
				409: ErrorResponseSchema,
			},
		},
	}, async (request, reply) => {
		const name = request.params.name.replace("_", "#");
		const gate = gates.find(g => g.name === name);

		if (!gate) {
			return reply.status(404).send({ error: `Gate with name ${name} not found.` });
		}

		if (gate.bus === "in") {
			return reply.status(403).send({ error: "Cannot write to an input gate." });
		}

		const force = request.query.force === "true";

		if (gate.locked && !force) {
			return reply.status(409).send({ error: `Gate ${name} is locked by a running regulation or cycle. Use ?force=true to override.` });
		}

		const value = (gate.size === "word") ? (parseFloat(request.params.value) || 0) : (request.params.value === "1" ? 1 : 0);

		await gate.write(value);
		return reply.status(200).send("");
	});
}
