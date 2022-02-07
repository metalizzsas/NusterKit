<script lang="ts">
	import Modal from '../modals/modal.svelte';
	import { machineData } from '$lib/utils/store';
	import { _ } from 'svelte-i18n';
	import { Linker } from '$lib/utils/linker';

	let displayWatchdogError = false;

	const startCycle = async () => {
		if (
			$machineData.cycle!.watchdogConditions.filter((wdc) => wdc.result == false).length > 0
		) {
			displayWatchdogError = true;
			//return;
		}

		fetch('http://' + $Linker + '/v1/cycle/', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
		});
	};
	const cancelCycle = async () => {
		fetch('http://' + $Linker + '/v1/cycle/0', {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
		});
	};
</script>

<div id="cyclewatchdog">
	<Modal
		title={$_('cycle.modals.watchdog.title')}
		message={$_('cycle.modals.watchdog.message')}
		displayClose={false}
		bind:shown={displayWatchdogError}
		buttons={[
			{
				text: $_('ok'),
				color: 'bg-gray-600',
				callback: () => {},
			},
		]}
	/>

	<div id="cyclePreparation" class="flex flex-col gap-4">
		<span
			class="rounded-xl bg-sky-500 py-1 px-5 text-white text-xl font-semibold shadow-2xl self-start my-3"
		>
			{$_('cycle.watchdog.conditions')}
		</span>
		{#if $machineData.cycle}
			<div class="grid grid-cols-2 gap-3">
				{#each $machineData.cycle.watchdogConditions as wdc}
					<span
						class="flex flex-row justify-between items-center rounded-full bg-gray-800 py-1 pr-2 pl-3 text-white font-semibold"
					>
						{$_('gates.names.' + wdc.gateName)}
						<div
							class="h-5 w-5 rounded-full {!wdc.result
								? 'bg-red-500'
								: 'bg-emerald-500'}"
						/>
					</span>
				{/each}
			</div>
			<div class="flex flex-row gap-4 items-center justify-items-center w-full">
				<button
					class="bg-orange-500 hover:bg-orange-500/80 hover:scale-[1.01] rounded-xl py-2 px-5 self-center text-white font-semibold transition:all mt-3"
					on:click={cancelCycle}
				>
					{$_('cycle.buttons.cancel')}
				</button>
				<button
					class="{$machineData.cycle.watchdogConditions.filter(
						(wdc) => wdc.result == false,
					).length > 0
						? 'bg-gray-400 hover:bg-gray-400/80'
						: 'bg-indigo-500 hover:bg-indigo-500/80 hover:scale-[1.01]'} rounded-xl py-2 px-5 self-center text-white font-semibold transition:all mt-3"
					on:click={startCycle}
				>
					{$_('cycle.buttons.start')}
				</button>
			</div>
		{/if}
	</div>
</div>
