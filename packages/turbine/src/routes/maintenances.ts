import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import type { CountableMaintenance } from "../maintenance/countable-maintenance";
import type { SensorMaintenance } from "../maintenance/sensor-maintenance";
import { MaintenanceNameParamsSchema, MaintenanceHydratedSchema, ErrorResponseSchema } from "../schemas";
import { z } from "zod";

interface MaintenanceRoutesOpts {
	tasks: (CountableMaintenance | SensorMaintenance)[];
}

export async function maintenanceRoutes(fastify: FastifyInstance, opts: MaintenanceRoutesOpts) {
	const { tasks } = opts;
	const app = fastify.withTypeProvider<ZodTypeProvider>();

	app.get("/", {
		schema: {
			response: {
				200: z.array(MaintenanceHydratedSchema),
			},
		},
	}, async () => {
		return tasks.map(t => t.toJSON());
	});

	app.get("/:name", {
		schema: {
			params: MaintenanceNameParamsSchema,
			response: {
				200: MaintenanceHydratedSchema,
				404: ErrorResponseSchema,
			},
		},
		preHandler: async (request, reply) => {
			const { name } = request.params as { name: string };
			if (!tasks.some(t => t.name === name)) {
				return reply.status(404).send({ error: "Maintenance task not found" });
			}
		},
	}, async (request) => {
		const { name } = request.params as { name: string };
		const task = tasks.find(t => t.name === name);
		return task!.toJSON();
	});

	app.delete("/:name", {
		schema: {
			params: MaintenanceNameParamsSchema,
			response: {
				200: z.string(),
				404: ErrorResponseSchema,
			},
		},
		preHandler: async (request, reply) => {
			const { name } = request.params as { name: string };
			if (!tasks.some(t => t.name === name)) {
				return reply.status(404).send({ error: "Maintenance task not found" });
			}
		},
	}, async (request, reply) => {
		const { name } = request.params as { name: string };
		const task = tasks.find(t => t.name === name);
		task?.reset();
		return reply.status(200).send("");
	});
}
