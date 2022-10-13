import type { IMaintenanceHydrated } from '@metalizzsas/nuster-typings/src/hydrated/maintenance';
import type { PageLoad } from './$types';

export const load: PageLoad = async (ctx) => {
	const dt = await ctx.fetch(`//${(window.localStorage.getItem('ip') ?? '127.0.0.1')}/api/v1/maintenance/${ctx.params.id}`);

	const data = await dt.json() as IMaintenanceHydrated;

	return { 
		maintenance: data
	};
};
