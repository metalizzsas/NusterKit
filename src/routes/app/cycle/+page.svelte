<script lang="ts">
	throw new Error(
		'@migration task: Add data prop (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292707)',
	);

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
