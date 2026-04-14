import type { ProfileService } from "./interfaces";
import type { ProfileHydrated } from "$types/hydrated/profiles";
import type { ProfilesRouter } from "../routers/ProfilesRouter";

/**
 * ProfileService adapter — wraps ProfilesRouter.findProfile() for direct access.
 */
export class ProfileServiceAdapter implements ProfileService {
	private profilesRouter: ProfilesRouter;

	constructor(profilesRouter: ProfilesRouter) {
		this.profilesRouter = profilesRouter;
	}

	async findProfile(id: string): Promise<ProfileHydrated | undefined> {
		return await this.profilesRouter.findProfile(id);
	}
}
