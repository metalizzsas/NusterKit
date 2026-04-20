import type { Profile as ProfilePrisma, ProfileValue as ProfileValuePrisma } from "@prisma/client";
import { prisma } from "../db";
import { TurbineEventLoop } from "../events";
import type { ProfileService } from "../services/interfaces";
import type { ProfileHydrated } from "../types/hydrated/profiles";
import type { Profile, ProfileSkeleton, ProfileSkeletonFields } from "../types/spec/profiles";

type ProfileStored = ProfilePrisma & {
	values: ProfileValuePrisma[];
};

export class ProfilesRouter implements ProfileService {
	private profileSkeletons: Map<string, ProfileSkeleton> = new Map<string, ProfileSkeleton>();

	constructor(profileSkeletons: ProfileSkeleton[], profilePremades: Profile[]) {
		for (const skeleton of profileSkeletons) {
			this.profileSkeletons.set(skeleton.name, structuredClone(skeleton));
		}

		TurbineEventLoop.emit("log", "info", "ProfilesRouter: Updating premade profiles.");
		prisma.profile
			.deleteMany({ where: { isPremade: true } })
			.then(async () => {
				for (const p of profilePremades) {
					const profile_base = await prisma.profile.create({
						data: {
							id: p.id,
							name: p.name,
							skeleton: p.skeleton,
							isPremade: true,
							modificationDate: new Date(),
						},
					});

					for (const value of p.values) {
						await prisma.profileValue.create({
							data: {
								key: value.key,
								value: value.value,
								profileId: profile_base.id,
							},
						});
					}
				}
			})
			.catch((err) => {
				TurbineEventLoop.emit("log", "error", `ProfilesRouter: premade sync failed: ${(err as Error).message}`);
			});
	}

	/**
	 * Hydrate the profile with its skeleton
	 * @param profile_stored Profile to hydrate from
	 * @returns The profile hydrated
	 */
	public hydrate_profile(profile_stored: ProfileStored): ProfileHydrated {
		// Find the skeleton assignated to this profile
		const profile_skeleton = structuredClone(this.profileSkeletons.get(profile_stored.skeleton));

		// Make sure that we have the skeleton for this profile
		if (profile_skeleton !== undefined) {
			const cloned_profile_values = profile_skeleton.fields
				.map((f) => {
					return { ...f, value: profile_stored.values.find((v) => v.key == f.name)?.value };
				})
				.filter((f) => f.value !== undefined) as ProfileSkeletonFields[];

			// Check if all skeleton fields are applied to the profile.
			// If not check all fields and add the missing ones.
			// This is usefull when profile are updated to newer skeleton with addtional fields

			const skeleton_field_names = profile_skeleton.fields.flatMap((f) => f.name);

			for (const sfn of skeleton_field_names) {
				if (cloned_profile_values.find((v) => v.name == sfn) === undefined) {
					const field_to_add = profile_skeleton.fields.find((f) => f.name == sfn);

					if (field_to_add === undefined) throw new Error(`Could not find field ${sfn} in skeleton ${profile_skeleton.name}`);

					cloned_profile_values.push(field_to_add);
				}
			}

			return {
				...profile_stored,
				values: cloned_profile_values.filter((f) => skeleton_field_names.includes(f.name)),
			};
		}

		throw new Error(`Could not find skeleton for profile ${profile_stored.name}`);
	}

	/**
	 * Find the profile and hydrates it from database
	 * @param id ID of the profile to find and hydrate from db
	 * @returns Profile hydrated if it was found
	 */
	public async find_profile(id: string): Promise<ProfileHydrated | undefined> {
		const profile = await prisma.profile.findUnique({ where: { id: id }, include: { values: true } });

		if (profile) return this.hydrate_profile(profile);

		return;
	}

	/**
	 * Prepare the profile to be ready to store on mongodb
	 * @param profile_hydrated Profile to be transformed
	 * @param removeID Removes the profile id to store
	 * @returns Profile transformed ready to be stored
	 */
	public prepare_to_store(profile_hydrated: ProfileHydrated): ProfileStored {
		const mapped_values = profile_hydrated.values.map((v) => {
			return { key: v.name, value: v.value, profileId: profile_hydrated.id, id: undefined };
		});

		const return_profile: ProfileStored = { ...profile_hydrated, values: mapped_values };

		return return_profile;
	}

	public async profileList(): Promise<ProfileHydrated[]> {
		return (await prisma.profile.findMany({ include: { values: true }, order_by: [{ isPremade: "asc" }, { modificationDate: "desc" }] })).map((d) =>
			this.hydrate_profile(d),
		);
	}
}
