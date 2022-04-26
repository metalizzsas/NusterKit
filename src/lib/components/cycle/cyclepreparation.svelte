<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	import { machineData } from '$lib/utils/store';
	import { Linker } from '$lib/utils/linker';
	import { _ } from 'svelte-i18n';

	let cycleTypes: { name: string; profileRequired: boolean }[] = [];

	let cyclePremades: { name: string; profile: string; cycle: string }[] = [];

	let premadeIndexSelected = -1;
	let userIndexSelected = -1;
	let userCycleTypeSelected = '';

	$: startReady = premadeIndexSelected != -1 || userIndexSelected != -1;

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
	});

	const prepareCycle = async () => {
		const urlEnd =
			userIndexSelected != -1
				? userCycleTypeSelected + '/' + $machineData.profiles.at(userIndexSelected)?.id
				: cyclePremades[premadeIndexSelected].cycle +
				  '/' +
				  cyclePremades[premadeIndexSelected].profile;

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
		<span class="font-semibold text-zinc-600 rounded-full py-1 px-3 my-2 bg-white inline-block">
			{$_('cycle.presets')}
		</span>
		<div class="grid grid-cols-3 gap-4 mt-3" in:fade out:fade>
			{#each cyclePremades as ct, index}
				<div
					class="{index === premadeIndexSelected
						? 'bg-indigo-500 hover:bg-indigo-500/80'
						: 'bg-gray-400 hover:bg-gray-400/80'} text-white p-2 flex flex-col items-center justify-center rounded-xl transition-all font-semibold {ct.name ==
					'custom'
						? 'col-span-2'
						: ''}"
					on:click={() => {
						premadeIndexSelected = premadeIndexSelected != index ? index : -1;
						userIndexSelected = -1;
						userCycleTypeSelected = '';
					}}
				>
					<div class="flex flex-row gap-4 items-center justify-items-start w-full">
						<!-- svelte-ignore a11y-missing-attribute -->
						<img
							src="http://{$Linker}/assets/cycle/{ct.name}.png"
							class="w-10 aspect-square bg-white rounded-full"
						/>
						<div class="text-md">{$_('cycle.types.' + ct.name)}</div>
					</div>
				</div>
			{/each}
		</div>

		{#if $machineData.profiles.filter((p) => p.isPremade == false).length > 0}
			<span
				class="font-semibold text-zinc-600 rounded-full py-1 px-3 mb-2 mt-5 bg-white inline-block"
			>
				{$_('cycle.user')}
			</span>

			<div class="grid grid-cols-3 gap-4 mt-3" in:fade out:fade>
				{#each cycleTypes.filter((k) => k.profileRequired) as ct}
					{#each $machineData.profiles.filter((p) => p.identifier == ct.name && p.isPremade == false) as p, index}
						<div
							class="{index === userIndexSelected
								? 'bg-indigo-500 hover:bg-indigo-500/80'
								: 'bg-gray-400 hover:bg-gray-400/80'} text-white p-2 flex flex-col items-center justify-center rounded-xl transition-all font-semibold {ct.name ==
							'custom'
								? 'col-span-2'
								: ''}"
							on:click={() => {
								userIndexSelected = userIndexSelected != index ? index : -1;
								userCycleTypeSelected =
									userCycleTypeSelected != ct.name ? ct.name : '';
								premadeIndexSelected = -1;
							}}
						>
							<div
								class="flex flex-row gap-4 items-center justify-items-start w-full"
							>
								<svg
									id="glyphicons-basic"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 32 32"
									class="w-10 aspect-square fill-white"
								>
									<path
										id="user"
										d="M27,24.23669V27a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V24.23669a1.57806,1.57806,0,0,1,.93115-1.36462L10.0672,20.167A5.02379,5.02379,0,0,0,14.55273,23h1.89454a5.02336,5.02336,0,0,0,4.48535-2.83313l5.13623,2.7052A1.57806,1.57806,0,0,1,27,24.23669ZM9.64478,14.12573a2.99143,2.99143,0,0,0,1.31073,1.462l.66583,3.05176A2.99994,2.99994,0,0,0,14.55237,21h1.89526a2.99994,2.99994,0,0,0,2.931-2.36047l.66583-3.05176a2.99115,2.99115,0,0,0,1.31073-1.462l.28-.75146A1.2749,1.2749,0,0,0,21,11.62988V9c0-3-2-5-5.5-5S10,6,10,9v2.62988a1.2749,1.2749,0,0,0-.63519,1.74439Z"
									/>
								</svg>

								<div class="flex flex-col">
									<div class="text-md">{p.name}</div>
									<div class="text-xs">{$_('cycle.names.' + ct.name)}</div>
								</div>
							</div>
						</div>
					{/each}
				{/each}
			</div>
		{/if}
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
