import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import type { Container } from "../containers/Containers";
import type { ServiceRegistry } from "../services/interfaces";
import { ContainerLoadParamsSchema, ContainerUnloadParamsSchema, RegulationStateParamsSchema, RegulationTargetParamsSchema, ErrorResponseSchema } from "../schemas";
import { z } from "zod";

interface ContainerRoutesOpts {
	containers: Container[];
	services?: ServiceRegistry;
}

export async function containerRoutes(fastify: FastifyInstance, opts: ContainerRoutesOpts) {
	const { containers, services } = opts;
	const app = fastify.withTypeProvider<ZodTypeProvider>();

	app.post("/:container/load/:series", {
		schema: {
			params: ContainerLoadParamsSchema,
			response: {
				200: z.string(),
				404: ErrorResponseSchema,
			},
		},
	}, async (request, reply) => {
		const container = containers.find(s => s.name === request.params.container);
		if (!container) {
			return reply.status(404).send({ error: "Container not found" });
		}
		await container.loadProduct(request.params.series);
		return reply.status(200).send("");
	});

	app.post("/:container/unload", {
		schema: {
			params: ContainerUnloadParamsSchema,
			response: {
				200: z.string(),
				404: ErrorResponseSchema,
			},
		},
	}, async (request, reply) => {
		const container = containers.find(s => s.name === request.params.container);
		if (!container) {
			return reply.status(404).send({ error: "Container not found" });
		}
		await container.unloadProduct();
		return reply.status(200).send("");
	});

	app.post("/:container/regulation/:regulation/state/:state", {
		schema: {
			params: RegulationStateParamsSchema,
			response: {
				200: z.string(),
				500: ErrorResponseSchema,
			},
		},
	}, async (request, reply) => {
		const state = request.params.state === "true";

		if (services) {
			const stateSet = await services.containers.setRegulationState(request.params.container, request.params.regulation, state);
			return reply.status(state === stateSet ? 200 : 500).send("");
		}

		return reply.status(500).send({ error: "Services not available" });
	});

	app.post("/:container/regulation/:regulation/target/:target", {
		schema: {
			params: RegulationTargetParamsSchema,
			response: {
				200: z.string(),
				500: ErrorResponseSchema,
			},
		},
	}, async (request, reply) => {
		const target = parseInt(request.params.target);

		if (services) {
			const targetSet = await services.containers.setRegulationTarget(request.params.container, request.params.regulation, target);
			return reply.status(target === targetSet ? 200 : 500).send("");
		}

		return reply.status(500).send({ error: "Services not available" });
	});
}
