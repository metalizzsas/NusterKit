import type { PageLoad } from './$types';
import type { IProfile } from '@metalizzsas/nuster-typings/build/spec/profile';

export const load: PageLoad = async (ctx) => {
	const content = await ctx.fetch(
		`//${window.localStorage.getItem('ip') ?? '127.0.0.1'}/api/v1/profiles/${
				ctx.params.id
			}`,
	);

	let profile: IProfile = await content.json();

	return { profile };
};
