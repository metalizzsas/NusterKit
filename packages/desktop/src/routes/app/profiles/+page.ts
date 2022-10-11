import type { IProfileHydrated } from '@metalizzsas/nuster-typings/src/hydrated/profile';
import type { IProfileSkeleton } from '@metalizzsas/nuster-typings/src/spec/profile';
import type { PageLoad } from './$types';

export const load: PageLoad = async (ctx) => {
	const profilesList = await ctx.fetch(
		`//${window.localStorage.getItem('ip') ?? '127.0.0.1'}/api/v1/profiles`,
	);

	const profileSkeletons = await ctx.fetch(
		`//${window.localStorage.getItem('ip') ?? '127.0.0.1'}/api/v1/profiles/skeletons`,
	);

	return {
		profiles: await profilesList.json() as IProfileHydrated,
		profileSkeletons: await profileSkeletons.json() as IProfileSkeleton,
	};
};
