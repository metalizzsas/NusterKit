import type { PageLoad } from '@sveltejs/kit';

throw new Error("@migration task: Check if you need to migrate the load function input (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292693)");
export const load: PageLoad = async (ctx) => {
	let dt = await ctx.fetch(
		'//' +
			(window.localStorage.getItem('ip') ?? '127.0.0.1') +
			'/api/v1/maintenance/' +
			ctx.params.id,
	);

	return { maintenance: await dt.json() };
};
