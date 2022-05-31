<script lang="ts">
	import Modal from '../modals/modal.svelte';
	import { machineData } from '$lib/utils/store';
	import { _ } from 'svelte-i18n';
	import { Linker } from '$lib/utils/linker';
	import Round from '../round.svelte';

	let displayWatchdogError = false;

	const startCycle = async () => {
		if (
			$machineData.cycle!.watchdogConditions.filter((wdc) => wdc.result == false).length > 0
		) {
			displayWatchdogError = true;
			//return;
		}

		fetch('http://' + $Linker + '/api/v1/cycle/', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
		});
	};
	const cancelCycle = async () => {
		fetch('http://' + $Linker + '/api/v1/cycle/0', {
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
		<div class="flex flex-col md:flex-row gap-1 md:gap-3 items-start md:items-center">
			<span
				class="rounded-full bg-indigo-400 py-1 px-5 text-white font-semibold shadow-2xl mt-2"
			>
				{$_('cycle.watchdog.conditions')}
			</span>

			<button
				class="bg-orange-500 hover:bg-orange-500/80 hover:scale-[1.01] rounded-xl py-1 px-3 self-center text-white font-semibold transition:all mt-3 md:ml-auto"
				on:click={cancelCycle}
			>
				{$_('cycle.buttons.cancel')}
			</button>
			<button
				class="{$machineData.cycle.watchdogConditions.filter((wdc) => wdc.result == false)
					.length > 0
					? 'bg-gray-400 hover:bg-gray-400/80'
					: 'bg-emerald-500 hover:bg-emerald-500/80 hover:scale-[1.01]'} rounded-xl py-1 px-3 self-center text-white font-semibold transition:all mt-3"
				on:click={startCycle}
			>
				{$_('cycle.buttons.start')}
			</button>
		</div>

		{#if $machineData.cycle}
			<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
				{#each $machineData.cycle.watchdogConditions as wdc}
					<span
						class="flex flex-row justify-between items-center rounded-full bg-gray-800 py-1 pr-2 pl-3 text-white font-semibold"
					>
						{$_('gates.names.' + wdc.gateName)}
						<Round
							size={5}
							color={wdc.result ? 'emerald-500' : 'red-500'}
							shadowColor={wdc.result ? 'emerald-300' : 'red-300'}
						/>
					</span>
				{/each}
			</div>
		{/if}
	</div>
</div>
