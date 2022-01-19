<script lang="ts">
	import { machineData } from '$lib/utils/store';

	const stopCycle = async () => {
		fetch('http://127.0.0.1/v1/cycle', {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
		});
	};
</script>

<div id="cycleRunner" class="flex flex-col gap-4">
	<span class="rounded-xl bg-indigo-500 py-1 px-2 text-white font-semibold self-start">
		Étapes du cycle
	</span>

	{#if $machineData.cycle}
		{#each $machineData.cycle.steps as s}
			<span
				class="bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl flex flex-row gap-4 justify-between"
			>
				{s.name}
				<div>{s.progress}</div>
			</span>
		{/each}
	{/if}

	<div class="flex flex-row gap-4 self-center">
		<button
			class="bg-red-500 rounded-xl py-2 px-5 text-white font-semibold"
			on:click={stopCycle}
		>
			Arrêter le cycle
		</button>

		<!-- TODO: Add options.nextstepEnabled button options on cycle
        {#if $machineData.cycle.options.nextStepEnabled === true}
    <button class="bg-indigo-500 rounded-xl py-2 px-5 text-white font-semibold">
        Passer a l'étape suivante
    </button>
    {/if} -->
	</div>
</div>
