<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { machineData } from '$lib/utils/stores/store';

	import Quickstart from '$lib/components/cycle/quickstart.svelte';
	import Passives from '../passive/passives.svelte';
	import Maintenances from '../maintenance/maintenances.svelte';
	import Slotslist from '../slots/slotslist.svelte';
	import Grid from '../layout/grid.svelte';
</script>

<Grid gap={6} cols={2} class="-mt-6">
	<Quickstart />

	{#if $machineData.passives.length == 0}
		<Slotslist inline={true} />
	{:else}
		<Passives />
	{/if}
</Grid>

{#if $machineData.passives.length > 0}
	<Slotslist />
{/if}

<Maintenances />
