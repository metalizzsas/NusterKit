import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import type { ProfileHydrated } from "$types/hydrated/profiles";
import type { ProfilesRouter } from "../routers/ProfilesRouter";
import { prisma } from "../db";
import { ProfileIdParamsSchema, ProfileHydratedSchema, ErrorResponseSchema } from "../schemas";
import { z } from "zod";

// Use passthrough for response — ProfileHydrated has complex union field types
const ProfileResponseSchema = z.any();

interface ProfileRoutesOpts {
	profilesRouter: ProfilesRouter;
}

export async function profileRoutes(fastify: FastifyInstance, opts: ProfileRoutesOpts) {
	const { profilesRouter } = opts;
	const app = fastify.withTypeProvider<ZodTypeProvider>();

	/** Premade protection hook */
	const premadeProtect = async (request: { params: { id?: string } }, reply: { status: (code: number) => { send: (body: unknown) => void } }) => {
		const id = (request.params as { id?: string }).id;
		if (!id) return;
		const profile = await prisma.profile.findUnique({ where: { id } });
		if (profile !== null && profile.isPremade) {
			return reply.status(403).send({ error: "Cannot edit or remove premade profiles." });
		}
	};

	app.get("/", {
		schema: {
			response: { 200: z.array(ProfileResponseSchema) },
		},
	}, async () => {
		return await profilesRouter.profileList();
	});

	app.post("/", {
		schema: {
			body: ProfileHydratedSchema,
			response: {
				200: ProfileResponseSchema,
				500: ErrorResponseSchema,
			},
		},
	}, async (request, reply) => {
		const copied = profilesRouter.prepareToStore(request.body as unknown as ProfileHydrated);

		const created = await prisma.profile.create({ data: {
			id: undefined,
			name: copied.name,
			skeleton: copied.skeleton,
			isPremade: false,
			modificationDate: new Date(),
			values: {
				create: copied.values.map(v => ({ key: v.key, value: v.value }))
			}
		}});

		const stored = await prisma.profile.findUnique({ where: { id: created.id }, include: { values: true } });

		if (stored === null) {
			return reply.status(500).send({ error: "Failed to find copied profile in database" });
		}

		return profilesRouter.hydrateProfile(stored);
	});

	app.get("/:id", {
		schema: {
			params: ProfileIdParamsSchema,
			response: {
				200: ProfileResponseSchema,
				404: ErrorResponseSchema,
			},
		},
	}, async (request, reply) => {
		const profile = await prisma.profile.findUnique({ where: { id: request.params.id }, include: { values: true } });

		if (!profile) {
			return reply.status(404).send({ error: `Could not find profile with id ${request.params.id}.` });
		}

		return profilesRouter.hydrateProfile(profile);
	});

	app.delete("/:id", {
		schema: {
			params: ProfileIdParamsSchema,
			response: {
				200: z.string(),
				403: ErrorResponseSchema,
				404: ErrorResponseSchema,
			},
		},
		preHandler: premadeProtect as never,
	}, async (request, reply) => {
		try {
			await prisma.profile.delete({ where: { id: request.params.id } });
			return reply.status(200).send("");
		} catch {
			return reply.status(404).send({ error: "Profile not found" });
		}
	});

	app.patch("/:id", {
		schema: {
			params: ProfileIdParamsSchema,
			body: ProfileHydratedSchema,
			response: {
				200: z.string(),
				403: ErrorResponseSchema,
				404: ErrorResponseSchema,
			},
		},
		preHandler: premadeProtect as never,
	}, async (request, reply) => {
		const body = { ...request.body, modificationDate: new Date() } as unknown as ProfileHydrated;
		const profile = profilesRouter.prepareToStore(body);

		try {
			await prisma.profile.update({
				where: { id: request.params.id },
				data: {
					name: profile.name,
					skeleton: profile.skeleton,
					modificationDate: undefined,
					values: {
						deleteMany: { profileId: request.params.id },
						create: profile.values.map(v => ({ key: v.key, value: v.value }))
					}
				}
			});
			return reply.status(200).send("");
		} catch {
			return reply.status(404).send({ error: "Failed to save profile" });
		}
	});
}
