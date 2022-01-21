<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	import { machineData } from '$lib/utils/store';
	import { date, time, _ } from 'svelte-i18n';

	let cycleTypes: string[] = [];
	let cycleTypeIndexSelected: number = -1;

	let cycleTypeFolded = false;

	let selectedProfileID: string = '';

	onMount(async () => {
		//fetch cycles types from machine api
		let cycleTypesData = await fetch('http://127.0.0.1/v1/cycle');
		cycleTypes = (await cycleTypesData.json()) as string[];

		if (cycleTypes.length == 1) cycleTypeIndexSelected = 0;
		cycleTypeFolded = true;
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
</script>

<div>
	<div id="cycleTypeChooser">
		<div class="flex flex-row gap-3 items-center justify-between align-center">
			<span class="bg-gray-500 h-8 w-8 p-1 rounded-xl text-center font-semibold text-white">
				1
			</span>
			<span class="bg-gray-500 py-1 px-3 rounded-xl font-semibold text-white">
				{$_('cycle-choice')}
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
							cycleTypeIndexSelected = cycleTypeIndexSelected != index ? index : -1;
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
			<span class="bg-gray-500 h-8 w-8 p-1 rounded-xl text-center font-semibold text-white">
				2
			</span>
			<span class="bg-gray-500 py-1 px-3 rounded-xl font-semibold text-white">
				{$_('profile-choice')}
			</span>
			<div class="h-[0.125em] shadow-lg w-7/12 block bg-gray-400/50 rounded-full" />
			<div
				class="h-4 w-4 rounded-full {selectedProfileID == ''
					? 'bg-red-500'
					: 'bg-emerald-500'} shadow-lg transition-colors"
			/>
		</div>

		<div class="grid grid-cols-1 gap-4 mt-3">
			{#each $machineData.profiles.filter((p) => p.identifier === cycleTypes[cycleTypeIndexSelected]) as p}
				<button
					class="{p.id === selectedProfileID
						? 'bg-gray-800 hover:bg-gray-800/80'
						: 'bg-gray-500 hover:bg-gray-500/80'} px-3 py-2 rounded-xl transition-all  text-white font-semibold flex flex-col"
					on:click={() => {
						selectedProfileID = selectedProfileID != p.id ? p.id : '';
					}}
				>
					<span>{p.name}</span>
					<span class="italic text-gray-200/50 text-sm">
						{$time(new Date(p.modificationDate), { format: 'medium' })} : {$date(
							new Date(p.modificationDate),
							{ format: 'short' },
						)}
					</span>
				</button>
			{/each}
		</div>
	</div>

	{#if selectedProfileID != ''}
		<div id="cyclePrepare" class="mt-6 flex flex-row justify-center">
			<button
				class="bg-indigo-600 hover:bg-indigo-600/80 rounded-xl py-2 px-5 text-white font-semibold transition-all"
				on:click={prepareCycle}
			>
				{$_('cycle-prepare-button')}
			</button>
		</div>
	{/if}
</div>
