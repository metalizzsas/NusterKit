import type { PageLoad } from './$types';

//throw new Error("@migration task: Check if you need to migrate the load function input (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292693)");

export const load: PageLoad = async (ctx) => {
	let profilesList = await ctx.fetch(
		`//${window.localStorage.getItem('ip') ?? '127.0.0.1'}/api/v1/profiles`,
	);

	let profileSkeletons = await ctx.fetch(
		`//${window.localStorage.getItem('ip') ?? '127.0.0.1'}/api/v1/profiles/skeletons`,
	);

	return {
		profiles: await profilesList.json(),
		profileSkeletons: await profileSkeletons.json(),
	};
};
