<script lang="ts">
	import { machineData } from '$lib/utils/stores/store';

	import Cyclepreparation from '$lib/components/cycle/steps/Preparation.svelte';
	import Cyclerunning from '$lib/components/cycle/steps/Running.svelte';
	import Cycleend from '$lib/components/cycle/steps/End.svelte';
	import Cyclesecurity from '$lib/components/cycle/steps/Security.svelte';

	import type { PageData } from './$types';
	export let data: PageData;

</script>

<div>
	{#if $machineData.cycle === undefined}
		<Cyclepreparation cyclePremades={data.cyclePremades} cycleTypes={data.cycleTypes} />
	{:else if $machineData.cycle.status.mode === 'created'}
		<Cyclesecurity />
	{:else if $machineData.cycle.status.mode === 'started'}
		<Cyclerunning />
	{:else if $machineData.cycle.status.mode === 'ended' || $machineData.cycle.status.mode === 'ending'}
		<Cycleend />
	{/if}
</div>
