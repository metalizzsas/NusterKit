<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	import { machineData } from '$lib/utils/store';
	import { Linker } from '$lib/utils/linker';
	import { _ } from 'svelte-i18n';

	let cycleTypes: { name: string; profileRequired: boolean }[] = [];

	let cyclePremades: { name: string; profile: string; cycle: string }[] = [];

	let customRunProfileSelected: string = '';
	let customRunCycleSelected: number = -1;

	let premadeCycleSelectedIndex = -1;

	$: startReady =
		premadeCycleSelectedIndex > -1
			? cyclePremades[premadeCycleSelectedIndex].name == 'custom'
				? customRunCycleSelected != -1 && customRunProfileSelected != ''
				: true
			: false;

	onMount(async () => {
		//fetch cycles types from machine api
		let cycleTypesData = await fetch('http://' + $Linker + '/v1/cycle/custom');
		cycleTypes = (await cycleTypesData.json()) as { name: string; profileRequired: boolean }[];

		//fetch premade cycles from machine api
		let cyclePremadesData = await fetch('http://' + $Linker + '/v1/cycle/premades');
		cyclePremades = (await cyclePremadesData.json()) as {
			name: string;
			profile: string;
			cycle: string;
		}[];
		cyclePremades.push({
			name: 'custom',
			profile: '',
			cycle: '',
		});
	});

	const prepareCycle = async () => {
		console.log(cyclePremades[premadeCycleSelectedIndex].name);
		const urlEnd =
			cyclePremades[premadeCycleSelectedIndex].name == 'custom'
				? `${cycleTypes[customRunCycleSelected]?.name}/${customRunProfileSelected}`
				: `${cyclePremades[premadeCycleSelectedIndex].cycle}/${cyclePremades[premadeCycleSelectedIndex].profile}`;
		const url = 'http://' + $Linker + '/v1/cycle/' + urlEnd;

		console.log(url);
		fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		});
	};
</script>

<div>
	<div id="cycleTypeChooser">
		<div
			class="flex flex-row gap-4 bg-gray-800 text-white font-semibold rounded-xl p-2 items-center"
		>
			<div class="bg-white text-orange rounded-full p-2 text-orange-500">!</div>
			<p class="shrink-1">{$_('cycle.choice.message')}</p>
		</div>
		<div class="grid grid-cols-3 gap-4 mt-3" in:fade out:fade>
			{#each cyclePremades as ct, index}
				<div
					class="{index === premadeCycleSelectedIndex
						? 'bg-indigo-500 hover:bg-indigo-400'
						: 'bg-gray-400 hover:bg-gray-300'} text-white px-3 py-2 flex flex-col items-center justify-center rounded-xl transition-all font-semibold {ct.name ==
					'custom'
						? 'col-span-2'
						: ''}"
					on:click={() => {
						premadeCycleSelectedIndex = premadeCycleSelectedIndex != index ? index : -1;
					}}
				>
					<span class="text-xl">{$_('cycle.types.' + ct.name)}</span>
					{#if ct.name == 'custom'}
						<div class="flex-col gap-4">
							<div class="flex flex-row gap-3">
								<label for="select-cycle">{$_('cycle.custom.select.cycle')}</label>
								<select
									name="select-cycle"
									class="px-2 py-1 text-gray-800"
									bind:value={customRunCycleSelected}
								>
									{#each cycleTypes as c, index}
										<option value={index}>{c.name}</option>
									{/each}
								</select>
							</div>
							{#if customRunCycleSelected != -1 && cycleTypes[customRunCycleSelected].profileRequired}
								<div class="flex flex-row gap-3">
									<label for="select-profile">
										{$_('cycle.custom.select.profile')}
									</label>
									<select
										name="select-profile"
										class="px-2 py-1 text-gray-800"
										bind:value={customRunProfileSelected}
									>
										{#each $machineData.profiles.filter((p) => p.identifier == cycleTypes[customRunCycleSelected]?.name) as p}
											<option value={p.id}>{p.name}</option>
										{/each}
									</select>
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
	<div id="cyclePrepare" class="mt-6 flex flex-row justify-center">
		<button
			class="{startReady
				? 'bg-indigo-600 hover:bg-indigo-600/80'
				: 'bg-gray-400 hover:bg-gray-500'} rounded-xl py-2 px-5 text-white font-semibold transition-all"
			on:click={() => {
				if (startReady) {
					prepareCycle();
				}
			}}
		>
			{$_('cycle.buttons.prepare')}
		</button>
	</div>
</div>
