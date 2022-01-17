<script context="module" lang="ts">
</script>

<script lang="ts">
	import Modal from '$lib/components/modals/modal.svelte';

	import { machineData } from '$lib/utils/store';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	import endSound from '$lib/sounds/cycle-end.wav';

	let endSoundStarted = false;
	let endSoundInstance: howler.Howl | null = null;

	import howler from 'howler';

	let cycleTypes: string[] = [];
	let cycleTypeIndexSelected = -1;

	let cycleTypeFolded = false;

	let selectedProfileID: string = '';

	let displayWatchdogError = false;

	onMount(async () => {
		let dt = await fetch('http://127.0.0.1/v1/cycle');

		cycleTypes = await dt.json();
	});

	const prepareCycle = async () => {
		fetch(
			`http://127.0.0.1/v1/cycle/${cycleTypes[cycleTypeIndexSelected]}/${selectedProfileID}`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			},
		);
	};

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

	const stopCycle = async () => {
		fetch('http://127.0.0.1/v1/cycle', {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
		});
	};

	const patchCycle = async () => {
		await fetch('http://127.0.0.1/v1/cycle/5', {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		endSoundInstance!.stop();
		window.location.href = '/app';
	};

	$: if ($machineData.cycle) {
		if ($machineData.cycle!.status.mode === 'ended' && endSoundStarted == false) {
			endSoundInstance = new howler.Howl({
				src: [endSound],
				loop: true,
				volume: 0.5,
			});

			endSoundInstance.play();

			endSoundStarted = true;
		}
	}
</script>

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

<div class="rounded-xl p-3 pt-0 -m-2 mt-12 bg-neutral-200 dark:bg-neutral-800 shadow-xl group">
	<div class="flex flex-row gap-5 justify-items-end -translate-y-4">
		<a
			href="/app"
			class="rounded-xl bg-red-400 text-white py-1 px-3 font-semibold flex flex-row gap-2 items-center"
		>
			<svg
				id="glyphicons-basic"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 32 32"
				class="h-5 w-5 fill-white"
			>
				<path
					id="chevron-left"
					d="M22.41406,23.37866a.5.5,0,0,1,0,.70709L19.586,26.91425a.50007.50007,0,0,1-.70715,0L8.67151,16.70709a.99988.99988,0,0,1,0-1.41418L18.87885,5.08575a.50007.50007,0,0,1,.70715,0l2.82806,2.8285a.5.5,0,0,1,0,.70709L15.03564,16Z"
				/>
			</svg>
		</a>
		<div
			class="rounded-xl bg-indigo-500 text-white py-1 px-8 font-semibold shadow-md group-hover:scale-105 transition-all"
		>
			{$machineData.cycle ? 'Cycle' : 'Préparation cycle'}
		</div>
	</div>

	{#if !$machineData.cycle}
		<div id="cycleStarterContent">
			<div id="cycleTypeChooser">
				<div class="flex flex-row gap-3 items-center justify-between align-center">
					<span
						class="bg-gray-500 h-8 w-8 p-1 rounded-xl text-center font-semibold text-white"
					>
						1
					</span>
					<span class="bg-gray-500 py-1 px-3 rounded-xl font-semibold text-white">
						Choix du cycle
					</span>
					<div class="h-[0.125em] shadow-lg w-7/12 block bg-gray-400/50 rounded-full" />
					<div
						class="h-4 w-4 rounded-full {cycleTypeIndexSelected == -1
							? 'bg-red-500'
							: 'bg-emerald-500'} shadow-lg transition-colors"
						on:click={() => (cycleTypeFolded = !cycleTypeFolded)}
					/>
				</div>

				{#if cycleTypeFolded != true}
					<div class="grid grid-cols-3 gap-4 mt-3" in:fade out:fade>
						{#each cycleTypes as ct, index}
							<button
								class="{index === cycleTypeIndexSelected
									? 'bg-emerald-300 hover:bg-emerald-300/80'
									: 'bg-gray-300 hover:bg-gray-300/80'} px-3 py-2 rounded-xl transition-all text-white font-semibold"
								on:click={() => {
									cycleTypeIndexSelected =
										cycleTypeIndexSelected != index ? index : -1;
									if (cycleTypeIndexSelected == -1) selectedProfileID = '';

									if (cycleTypeIndexSelected != -1) cycleTypeFolded = true;
								}}
							>
								{ct}
							</button>
						{/each}
					</div>
				{/if}
			</div>
			<div id="cycleProfileChooser" class="mt-6">
				<div class="flex flex-row gap-3 items-center justify-between">
					<span
						class="bg-gray-500 h-8 w-8 p-1 rounded-xl text-center font-semibold text-white"
					>
						2
					</span>
					<span class="bg-gray-500 py-1 px-3 rounded-xl font-semibold text-white">
						Choix du profil
					</span>
					<div class="h-[0.125em] shadow-lg w-7/12 block bg-gray-400/50 rounded-full" />
					<div
						class="h-4 w-4 rounded-full {selectedProfileID == ''
							? 'bg-red-500'
							: 'bg-emerald-500'} shadow-lg transition-colors"
					/>
				</div>

				<div class="grid grid-cols-3 gap-4 mt-3">
					{#each $machineData.profiles.filter((p) => p.identifier === cycleTypes[cycleTypeIndexSelected]) as p}
						<button
							class="{p.id === selectedProfileID
								? 'bg-emerald-500'
								: 'bg-gray-300'} px-3 py-2 rounded-xl transition-all hover:bg-gray-800/80 text-white font-semibold flex flex-col"
							on:click={() => {
								selectedProfileID = selectedProfileID != p.id ? p.id : '';
							}}
						>
							<span>{p.name}</span>
							<span class="italic text-gray-400/50 text-sm">
								{p.modificationDate}
							</span>
						</button>
					{/each}
				</div>
			</div>

			{#if selectedProfileID != ''}
				<div id="cyclePrepare" class="mt-6 flex flex-row justify-center">
					<button
						class="bg-indigo-600 rounded-xl py-2 px-5 text-white font-semibold"
						on:click={prepareCycle}
					>
						Préparer le cycle
					</button>
				</div>
			{/if}
		</div>
	{:else}
		<div id="cycleContent">
			{#if $machineData.cycle.status.mode === 'created'}
				<div id="cyclePreparation" class="flex flex-col gap-4">
					<span
						class="rounded-xl bg-indigo-500 py-1 px-2 text-white font-semibold self-start"
					>
						Conditions de démarrage
					</span>
					{#each $machineData.cycle.watchdogConditions as wdc}
						<span
							class="flex flex-row justify-between items-center rounded-xl bg-gray-500 py-1 px-3 text-white font-semibold"
						>
							{wdc.gateName}
							<div
								class="h-5 w-5 rounded-full {!wdc.result
									? 'bg-red-500'
									: 'bg-green-500'}"
							/>
						</span>
					{/each}

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
			{:else}
				<div id="cycleRunner" class="flex flex-col gap-4">
					<span
						class="rounded-xl bg-indigo-500 py-1 px-2 text-white font-semibold self-start"
					>
						Étapes du cycle
					</span>

					{#each $machineData.cycle.steps as s}
						<span
							class="bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl flex flex-row gap-4 justify-between"
						>
							{s.name}
							<div>{s.progress}</div>
						</span>
					{/each}

					<div class="flex flex-row gap-4 self-center">
						{#if $machineData.cycle.status.mode !== 'ended'}
							<button
								class="bg-red-500 rounded-xl py-2 px-5 text-white font-semibold"
								on:click={stopCycle}
							>
								Arrêter le cycle
							</button>
						{:else}
							<button
								class="bg-orange-500 rounded-xl py-2 px-5 text-white font-semibold"
								on:click={patchCycle}
							>
								Terminer le cycle
							</button>
						{/if}

						<!-- TODO: Add options.nextstepEnabled button options on cycle
                            {#if $machineData.cycle.options.nextStepEnabled === true}
                        <button class="bg-indigo-500 rounded-xl py-2 px-5 text-white font-semibold">
                            Passer a l'étape suivante
                        </button>
                        {/if} -->
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
