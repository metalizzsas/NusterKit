import type { PageLoad } from './$types';

import type { IHistoryHydrated } from "@metalizzsas/nuster-typings/src/hydrated/cycle/index";

export const load: PageLoad = async (ctx) => {
	let content = await ctx.fetch(
		'//' + (window.localStorage.getItem('ip') ?? '127.0.0.1') + '/api/v1/cycle/history',
	);
	return { histories: (await content.json()) as IHistoryHydrated[] };
};
