import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import type { Container } from "../containers/containers";
import type { ContainersRouter } from "../routers/containers-routers";
import {
	ContainerLoadParamsSchema,
	ContainerUnloadParamsSchema,
	ErrorResponseSchema,
	RegulationStateParamsSchema,
	RegulationTargetParamsSchema,
} from "../schemas";

interface ContainerRoutesOpts {
	containers: Container[];
	container_router: ContainersRouter;
}

export async function container_routes(fastify: FastifyInstance, opts: ContainerRoutesOpts) {
	const { containers, container_router } = opts;
	const app = fastify.withTypeProvider<ZodTypeProvider>();

	app.post(
		"/:container/load/:series",
		{
			schema: {
				params: ContainerLoadParamsSchema,
				response: {
					200: z.string(),
					404: ErrorResponseSchema,
				},
			},
		},
		async (request, reply) => {
			const container = containers.find((s) => s.name === request.params.container);
			if (!container) {
				return reply.status(404).send({ error: "Container not found" });
			}
			await container.load_product(request.params.series);
			return reply.status(200).send("");
		},
	);

	app.post(
		"/:container/unload",
		{
			schema: {
				params: ContainerUnloadParamsSchema,
				response: {
					200: z.string(),
					404: ErrorResponseSchema,
				},
			},
		},
		async (request, reply) => {
			const container = containers.find((s) => s.name === request.params.container);
			if (!container) {
				return reply.status(404).send({ error: "Container not found" });
			}
			await container.unload_product();
			return reply.status(200).send("");
		},
	);

	app.post(
		"/:container/regulation/:regulation/state/:state",
		{
			schema: {
				params: RegulationStateParamsSchema,
				response: {
					200: z.string(),
					500: ErrorResponseSchema,
				},
			},
		},
		async (request, reply) => {
			const state = request.params.state === "true";
			const state_set = await container_router.set_regulation_state(request.params.container, request.params.regulation, state);
			return reply.status(state === state_set ? 200 : 500).send("");
		},
	);

	app.post(
		"/:container/regulation/:regulation/target/:target",
		{
			schema: {
				params: RegulationTargetParamsSchema,
				response: {
					200: z.string(),
					500: ErrorResponseSchema,
				},
			},
		},
		async (request, reply) => {
			const target = parseInt(request.params.target);
			const target_set = await container_router.set_regulation_target(request.params.container, request.params.regulation, target);
			return reply.status(target === target_set ? 200 : 500).send("");
		},
	);
}
