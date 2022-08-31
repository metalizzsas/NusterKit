import type { IHistory } from '$lib/utils/interfaces';
import type { PageLoad } from './$types';

export const load: PageLoad = async (ctx) => {
	let content = await ctx.fetch(
		'//' + (window.localStorage.getItem('ip') ?? '127.0.0.1') + '/api/v1/cycle/history',
	);
	return { histories: (await content.json()) as IHistory[] };
};
