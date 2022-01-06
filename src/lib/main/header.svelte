<script lang="ts">
	import '$lib/app.css';
	import Button from '$lib/components/button.svelte';

	import { machineList } from '$lib/utils/store';
	import Machine from './machine.svelte';
</script>

<div class="flex flex-row justify-between">
	<h1 class="text-2xl">Liste des machines</h1>
	<Button color="green-500" colorHover="green-400">Ajouter une machine</Button>
</div>

<div id="machineListContainer" class="mt-3">
	{#each $machineList as machine, index}
		<Machine {machine} {index} />
	{/each}
</div>
