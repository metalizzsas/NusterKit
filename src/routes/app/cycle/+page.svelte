<script lang="ts">
	import { _ } from 'svelte-i18n';
	import '$lib/app.css';

	import { machineData } from '$lib/utils/stores/store';

	import Cyclepreparation from '$lib/components/cycle/cyclepreparation.svelte';
	import Cyclerunning from '$lib/components/cycle/cyclerunning.svelte';
	import Cycleend from '$lib/components/cycle/cycleend.svelte';
	import Cyclesecurity from '$lib/components/cycle/cyclesecurity.svelte';
	import { navActions } from '$lib/utils/stores/navstack';

	import type { PageData } from './$types';
	export let data: PageData;

	$navActions = [];
</script>

<div>
	{#if $machineData.cycle === undefined}
		<Cyclepreparation cyclePremades={data.cyclePremades} cycleTypes={data.cycleTypes} />
	{:else if $machineData.cycle.status.mode === 'created'}
		<Cyclesecurity />
	{:else if $machineData.cycle.status.mode === 'started'}
		<Cyclerunning />
	{:else if $machineData.cycle.status.mode === 'ended'}
		<Cycleend />
	{/if}
</div>
