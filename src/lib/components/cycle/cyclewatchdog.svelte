<script lang="ts">
	import Modal from '../modals/modal.svelte';
	import { machineData } from '$lib/utils/store';
	import { _ } from 'svelte-i18n';
	import { Linker } from '$lib/utils/linker';
	import Round from '../round.svelte';
	import { flip } from 'svelte/animate';

	let displayWatchdogError = false;

	const startCycle = async () => {
		if (
			$machineData.cycle!.watchdogConditions.filter((wdc) => wdc.result == false).length > 0
		) {
			//displayWatchdogError = true;
			return;
		}

		fetch($Linker + '/api/v1/cycle/', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
		});
	};
	const cancelCycle = async () => {
		fetch($Linker + '/api/v1/cycle/0', {
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
			class="rounded-full bg-indigo-400 py-1 px-5 text-white font-semibold shadow-2xl mt-2 self-start"
		>
			{$_('cycle.watchdog.conditions')}
		</span>

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

		<div class="flex flex-row gap-4 justify-items-center self-center">
			<button
				class="bg-orange-500 hover:bg-orange-500/80 hover:scale-[1.01] rounded-xl py-1 px-3 self-center text-white font-semibold transition:all mt-3 md:ml-auto"
				on:click={cancelCycle}
			>
				{$_('cycle.buttons.cancel')}
			</button>
			<button
				class="flex flex-row gap-1 align-middle items-center {$machineData.cycle.watchdogConditions.filter(
					(wdc) => wdc.result == false,
				).length > 0
					? 'bg-gray-400 hover:bg-gray-400/80'
					: 'bg-emerald-500 hover:bg-emerald-500/80 hover:scale-[1.01]'} rounded-xl py-2 px-5 self-center text-white fill-white font-semibold text-lg transition:all mt-3"
				on:click={startCycle}
			>
				{#if $machineData.cycle.watchdogConditions.filter((wdc) => wdc.result == true).length > 0}
					<div animate={flip}>
						<svg
							id="glyphicons-basic"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 32 32"
							class="h-6 w-6 animate-bounceX"
						>
							<path
								id="arrow-right"
								d="M26.82965,16.81921l-9.25622,6.47937A1,1,0,0,1,16,22.47937V19H6a1,1,0,0,1-1-1V14a1,1,0,0,1,1-1H16V9.52063a1,1,0,0,1,1.57343-.81921l9.25622,6.47937A.99994.99994,0,0,1,26.82965,16.81921Z"
							/>
						</svg>
					</div>
				{/if}

				{$_('cycle.buttons.start')}
			</button>
		</div>
	</div>
</div>

<style>
	@keyframes bounceX {
		0%,
		100% {
			transform: translateX(-25%);
			animate-timing-function: cubic-bezier(0.8, 0, 1, 1);
		}
		50% {
			transform: none;
			animate-timing-function: cubic-bezier(0, 0, 0.2, 1);
		}
	}

	.animate-bounceX {
		animation: bounceX 1s infinite;
	}
</style>
