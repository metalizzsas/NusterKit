<script lang="ts">
	
	import Navcontainer from '../navigation/navcontainer.svelte';
	import Navcontainertitle from '../navigation/navcontainertitle.svelte';
	
	import Slotproduct from './slotproduct.svelte';
	
	import { machineData } from '$lib/utils/stores/store';
	import { _ } from 'svelte-i18n';

	export let inline = false;
</script>

<Navcontainer>
	<Navcontainertitle>{$_('slots.name')}</Navcontainertitle>
	<div
		class="grid {inline
			? 'grid-cols-1'
			: 'grid-cols-1 md:grid-cols-3'} h-[50vh] md:h-full overflow-scroll md:overflow-visible gap-4"
	>
		{#each $machineData.slots.sort((a, b) => b.sensors.length - a.sensors.length) as slot}
			<Slotproduct bind:slotContent={slot} />
		{/each}
	</div>
</Navcontainer>
