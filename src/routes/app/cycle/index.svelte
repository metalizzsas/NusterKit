<script lang="ts" context="module">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = async (ctx) => {
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
			props: {
				cycleTypes,
				cyclePremades,
			},
		};
	};
</script>

<script lang="ts">
	import { _ } from 'svelte-i18n';
	import '$lib/app.css';

	import { machineData } from '$lib/utils/store';

	import Cyclepreparation from '$lib/components/cycle/cyclepreparation.svelte';
	import Cyclerunning from '$lib/components/cycle/cyclerunning.svelte';
	import Cycleend from '$lib/components/cycle/cycleend.svelte';
	import Cyclesecurity from '$lib/components/cycle/cyclesecurity.svelte';
	import { navActions } from '$lib/utils/navstack';

	export let cycleTypes: { name: string; profileRequired: boolean }[];
	export let cyclePremades: { name: string; profile: string; cycle: string }[];

	$navActions = [];
</script>

<div>
	{#if $machineData.cycle === undefined}
		<Cyclepreparation {cyclePremades} {cycleTypes} />
	{:else if $machineData.cycle.status.mode === 'created'}
		<Cyclesecurity />
	{:else if $machineData.cycle.status.mode === 'started'}
		<Cyclerunning />
	{:else if $machineData.cycle.status.mode === 'ended'}
		<Cycleend />
	{/if}
</div>
