import type { IHistory } from '$lib/utils/interfaces';
import type { PageLoad } from './$types';

export const load: PageLoad = async (ctx) => {
	let dt = await ctx.fetch(
		'//' +
			(window.localStorage.getItem('ip') ?? '127.0.0.1') +
			'/api/v1/cycle/history/' +
			ctx.params.id,
	);

	return { history: await dt.json() as IHistory };
};
