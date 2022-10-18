import type { PageLoad } from './$types';
import type { IProfileHydrated } from '@metalizzsas/nuster-typings/build/hydrated/profile';

export const load: PageLoad = async (ctx) => {
	const content = await ctx.fetch(
		`//${window.localStorage.getItem('ip') ?? '127.0.0.1'}/api/v1/profiles/${
				ctx.params.id
			}`,
	);

	const profile: IProfileHydrated = await content.json();

	return { profile };
};