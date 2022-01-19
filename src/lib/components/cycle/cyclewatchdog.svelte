<script lang="ts">
	import Modal from '../modals/modal.svelte';
	import { machineData } from '$lib/utils/store';

	let displayWatchdogError = false;

	const startCycle = async () => {
		if (
			$machineData.cycle!.watchdogConditions.filter((wdc) => wdc.result == false).length > 0
		) {
			displayWatchdogError = true;
			//return;
		}

		fetch('http://127.0.0.1/v1/cycle/', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
		});
	};
</script>

<div id="cyclewatchdog">
	<Modal
		title="Watchdog"
		message="Les conditions de démarrage ne sont pas valides"
		displayClose={false}
		bind:shown={displayWatchdogError}
		buttons={[
			{
				text: 'ok',
				color: 'bg-gray-600',
				callback: () => {},
			},
		]}
	/>

	<div id="cyclePreparation" class="flex flex-col gap-4">
		<span class="rounded-xl bg-indigo-500 py-1 px-2 text-white font-semibold self-start">
			Conditions de démarrage
		</span>
		{#if $machineData.cycle}
			{#each $machineData.cycle.watchdogConditions as wdc}
				<span
					class="flex flex-row justify-between items-center rounded-xl bg-gray-500 py-1 px-3 text-white font-semibold"
				>
					{wdc.gateName}
					<div
						class="h-5 w-5 rounded-full {!wdc.result ? 'bg-red-500' : 'bg-green-500'}"
					/>
				</span>
			{/each}

			<div class="flex flex-row self-center gap-4">
				<button
					class="{$machineData.cycle.watchdogConditions.filter(
						(wdc) => wdc.result == false,
					).length > 0
						? 'bg-gray-300'
						: 'bg-emerald-500'} rounded-xl py-2 px-5 self-center text-white font-semibold"
					on:click={startCycle}
				>
					Lancer le cycle
				</button>
			</div>
		{/if}
	</div>
</div>
