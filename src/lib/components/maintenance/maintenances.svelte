<script lang="ts">
	import Navcontainer from '../navigation/navcontainer.svelte';
	import Navcontainertitle from '../navigation/navcontainertitle.svelte';
	import Maintenance from './maintenance.svelte';

	import { machineData } from '$lib/utils/store';
	import { _ } from 'svelte-i18n';
</script>

{#if $machineData.maintenances.length > 0}
	<Navcontainer>
		<Navcontainertitle>{$_('maintenance.list')}</Navcontainertitle>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			{#each $machineData.maintenances.filter((m) => m.name !== 'cycleCount') as m}
				<Maintenance bind:maintenance={m} />
			{/each}
		</div>
	</Navcontainer>
{/if}
