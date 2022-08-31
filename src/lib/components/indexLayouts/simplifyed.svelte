<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { machineData } from '$lib/utils/store';

	import Quickstart from '$lib/components/cycle/quickstart.svelte';
	import Navcontainer from '$lib/components/navigation/navcontainer.svelte';
	import Navcontainertitle from '$lib/components/navigation/navcontainertitle.svelte';
	import Passives from '../passive/passives.svelte';
	import Maintenances from '../maintenance/maintenances.svelte';
	import Slotslist from '../slots/slotslist.svelte';
</script>

<div class="grid grid-cols-2 gap-6 -mt-6">
	<Navcontainer>
		<Navcontainertitle>{$_('cycle.quickstart.head')}</Navcontainertitle>
		<Quickstart />
	</Navcontainer>

	{#if $machineData.passives.length == 0}
		<Slotslist />
	{/if}

	<Passives />
</div>

{#if $machineData.passives.length > 0}
	<Slotslist />
{/if}

<Maintenances />
