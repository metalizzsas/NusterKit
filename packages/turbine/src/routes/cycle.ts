import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import type { ProfileHydrated } from "$types/hydrated/profiles";
import type { CyclePremade, ProgramBlockRunner as ProgramBlockRunnerConfig } from "$types/spec/cycle";
import { TurbineEventLoop } from "../events";
import { ProgramBlockRunner } from "../pbr/program-block-runner";
import { CyclePremadeSchema, CycleStartParamsSchema, CycleTypeSchema, ErrorResponseSchema, ProfileHydratedSchema } from "../schemas";
import type { ServiceRegistry } from "../services/interfaces";

interface CycleRoutesOpts {
	cycleTypes: ProgramBlockRunnerConfig[];
	cyclePremades: CyclePremade[];
	service_registry?: ServiceRegistry;
	/** Shared mutable reference to the current program */
	state: { program?: ProgramBlockRunner };
}

export async function cycle_routes(fastify: FastifyInstance, opts: CycleRoutesOpts) {
	const { cycleTypes, cyclePremades, service_registry, state } = opts;
	const app = fastify.withTypeProvider<ZodTypeProvider>();

	app.get(
		"/premades",
		{
			schema: {
				response: { 200: z.array(CyclePremadeSchema) },
			},
		},
		async () => {
			return cyclePremades;
		},
	);

	app.get(
		"/types",
		{
			schema: {
				response: { 200: z.array(CycleTypeSchema) },
			},
		},
		async () => {
			return cycleTypes.map((c) => ({ name: c.name, profileRequired: c.profileRequired }));
		},
	);

	app.post(
		"/:name/:id?",
		{
			schema: {
				params: CycleStartParamsSchema,
				body: ProfileHydratedSchema.nullable().optional(),
				response: {
					200: z.string(),
					400: ErrorResponseSchema,
					404: ErrorResponseSchema,
				},
			},
		},
		async (request, reply) => {
			let profile: ProfileHydrated | undefined;

			if (request.params.id) {
				if (service_registry) {
					profile = await service_registry.profiles.find_profile(request.params.id);
				}

				if (profile === undefined) {
					return reply.status(404).send({ error: "Profile id was given but profile was not found." });
				}
			} else if (request.body && Object.keys(request.body).length > 0) {
				profile = request.body as ProfileHydrated;
				TurbineEventLoop.emit("log", "info", "CR: Profile given by body.");
			} else {
				TurbineEventLoop.emit("log", "warning", "CR: Request does not give a profile");
			}

			const cycle = cycleTypes.find((ct) => ct.name === request.params.name);

			if (!cycle) {
				return reply.status(404).send({ error: "Cycle not found" });
			}

			TurbineEventLoop.emit("log", "info", "CR: Config PBR found.");
			state.program = new ProgramBlockRunner(cycle, profile, service_registry);
			TurbineEventLoop.emit("ws.dirty", "cycle");

			if (state.program.profileRequired && profile !== undefined && state.program.name !== profile.skeleton) {
				const error = `Profile ${state.program.name} is not compatible with cycle profile ${profile.skeleton}.`;
				state.program = undefined;
				TurbineEventLoop.emit("ws.dirty", "cycle");
				return reply.status(400).send({ error });
			}

			return reply.status(200).send("");
		},
	);

	// Guard: all sub-routes below require an active program
	const require_program = async (_request: unknown, reply: { status: (code: number) => { send: (body: unknown) => void } }) => {
		if (state.program === undefined) {
			return reply.status(404).send({ error: "Cycle not started" });
		}
	};

	app.post(
		"/",
		{
			schema: { response: { 200: z.string(), 404: ErrorResponseSchema } },
			preHandler: require_program as never,
		},
		async (_request, reply) => {
			state.program?.run();
			return reply.status(200).send("");
		},
	);

	app.put(
		"/",
		{
			schema: { response: { 200: z.string(), 404: ErrorResponseSchema } },
			preHandler: require_program as never,
		},
		async (_request, reply) => {
			state.program?.next_step();
			return reply.status(200).send("");
		},
	);

	app.put(
		"/pause",
		{
			schema: { response: { 200: z.string(), 404: ErrorResponseSchema } },
			preHandler: require_program as never,
		},
		async () => {
			TurbineEventLoop.emit(`pbr.${state.program?.status.mode === "paused" ? "resume" : "pause"}`);
			return state.program?.status.mode === "paused" ? "resuming" : "pausing";
		},
	);

	app.patch(
		"/",
		{
			schema: { response: { 200: z.string(), 403: ErrorResponseSchema, 404: ErrorResponseSchema } },
			preHandler: require_program as never,
		},
		async (_request, reply) => {
			if (["ended", "created"].includes(state.program?.status.mode ?? "")) {
				state.program = undefined;
				TurbineEventLoop.emit("ws.dirty", "cycle");
				return reply.status(200).send("");
			}
			return reply.status(403).send({ error: "Cannot dispose a cycle that has not ended." });
		},
	);

	app.delete(
		"/",
		{
			schema: { response: { 200: z.string(), 404: ErrorResponseSchema } },
			preHandler: require_program as never,
		},
		async (_request, reply) => {
			state.program?.end("user");
			return reply.status(200).send("");
		},
	);
}
