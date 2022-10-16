import type { PageLoad } from './$types';
import type { IHistoryHydrated } from "@metalizzsas/nuster-typings/build/hydrated/cycle";

export const load: PageLoad = async (ctx) => {
	const dt = await ctx.fetch(
		'//' +
			(window.localStorage.getItem('ip') ?? '127.0.0.1') +
			'/api/v1/cycle/history/' +
			ctx.params.id,
	);

	return { history: await dt.json() as IHistoryHydrated };
};
