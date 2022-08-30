import type { PageLoad } from '@sveltejs/kit';

throw new Error("@migration task: Check if you need to migrate the load function input (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292693)");
export const load: PageLoad = async (ctx) => {
	//fetch cycles types from machine api
	let cycleTypesData = await ctx.fetch(
		'//' + (window.localStorage.getItem('ip') ?? '127.0.0.1') + '/api/v1/cycle/custom',
	);

	const cycleTypes = (await cycleTypesData.json()) as {
		name: string;
		profileRequired: boolean;
	}[];

	//fetch premade cycles from machine api
	let cyclePremadesData = await ctx.fetch(
		'//' + (window.localStorage.getItem('ip') ?? '127.0.0.1') + '/api/v1/cycle/premades',
	);

	const cyclePremades = (await cyclePremadesData.json()) as {
		name: string;
		profile: string;
		cycle: string;
	}[];

	return {
		cycleTypes,
		cyclePremades,
	};
};
