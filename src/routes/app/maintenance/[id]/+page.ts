import type { Maintenance } from '$lib/utils/interfaces';
import type { PageLoad } from './$types';

export const load: PageLoad = async (ctx) => {
	let dt = await ctx.fetch(
		'//' +
			(window.localStorage.getItem('ip') ?? '127.0.0.1') +
			'/api/v1/maintenance/' +
			ctx.params.id,
	);

	return { 
		maintenance: await dt.json() as Maintenance
	};
};
