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
						? 'bg-indigo-500 hover:bg-indigo-500/80'
						: 'bg-gray-400 hover:bg-gray-400/80'} text-white px-3 py-2 flex flex-col items-center justify-center rounded-xl transition-all font-semibold {ct.name ==
					'custom'
						? 'col-span-2'
						: ''}"
					on:click={() => {
						premadeCycleSelectedIndex = premadeCycleSelectedIndex != index ? index : -1;
					}}
				>
					{#if ct.name != 'custom'}
						<!-- svelte-ignore a11y-missing-attribute -->
						<img
							src="http://{$Linker}/assets/cycle/{ct.name}.png"
							class="w-16 h-16 bg-white rounded-full mb-2"
						/>
					{:else}
						<svg
							id="glyphicons-basic"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 32 32"
							class="'w-16 h-16 fill-white"
						>
							<path
								id="wrench"
								d="M27.405,12.91907a6.38551,6.38551,0,0,1-7.78314,3.70154L8.82825,27.41418A1,1,0,0,1,7.414,27.41412L4.58594,24.58575A.99993.99993,0,0,1,4.586,23.17157L15.33209,12.42548a6.4047,6.4047,0,0,1,3.69947-7.92487,6.22745,6.22745,0,0,1,2.77825-.49127.4987.4987,0,0,1,.34015.84857L19.73254,7.27533a.4961.4961,0,0,0-.131.469l.82916,3.38044a.496.496,0,0,0,.36365.36364l3.38068.82935a.49614.49614,0,0,0,.469-.131l2.419-2.41889a.49433.49433,0,0,1,.8446.30078A6.22117,6.22117,0,0,1,27.405,12.91907Z"
							/>
						</svg>
					{/if}

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
