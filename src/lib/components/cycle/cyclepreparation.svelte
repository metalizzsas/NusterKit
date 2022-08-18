<script lang="ts">
	import { goto } from '$app/navigation';
	import { machineData } from '$lib/utils/store';
	import { Linker } from '$lib/utils/linker';
	import { _ } from 'svelte-i18n';
	import Cyclelabel from './cyclelabel.svelte';
	import { navActions, navTitle, useNavContainer } from '$lib/utils/navstack';
	import { onDestroy } from 'svelte';
	import Navcontainer from '../navigation/navcontainer.svelte';
	import Navcontainertitle from '../navigation/navcontainertitle.svelte';
	import { layoutSimplified } from '$lib/utils/settings';

	function prepareCycle(cycleType: string, profileID: string) {
		fetch('//' + $Linker + '/api/v1/cycle/' + cycleType + '/' + profileID, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				host: $Linker,
			},
		});
	}

	export let cycleTypes: { name: string; profileRequired: boolean }[];
	export let cyclePremades: { name: string; profile: string; cycle: string }[];

	$navTitle = [$_('cycle.button'), $_('cycle.preparation')];
	$navActions = [
		{
			action: () => goto('/app/cycle/histories'),
			label: $_('cycle.history'),
			color: 'bg-orange-500',
		},
	];

	$useNavContainer = false;

	onDestroy(() => {
		$navActions = null;
		$useNavContainer = true;
	});

	$: if ($machineData.cycle === undefined && $layoutSimplified == true) goto('/app');
</script>

<div>
	{#if cyclePremades.filter((c) => c.cycle == 'default').length > 0}
		<Navcontainer>
			<Navcontainertitle>{$_('cycle.presets')}</Navcontainertitle>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				{#each cyclePremades.filter((c) => c.cycle == 'default') as ct, index}
					<Cyclelabel {ct} />
				{/each}
			</div>
		</Navcontainer>
	{/if}
	{#if cyclePremades.filter((c) => c.cycle != 'default').length > 0}
		<Navcontainer>
			<Navcontainertitle>{$_('cycle.presets-anex')}</Navcontainertitle>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				{#each cyclePremades.filter((c) => c.cycle != 'default') as ct, index}
					<Cyclelabel {ct} />
				{/each}
			</div>
		</Navcontainer>
	{/if}

	{#if $machineData.profiles.filter((p) => p.isPremade == false).length > 0}
		<Navcontainer>
			<Navcontainertitle>{$_('cycle.user')}</Navcontainertitle>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				{#each cycleTypes.filter((k) => k.profileRequired) as ct}
					{#each $machineData.profiles.filter((p) => p.identifier == ct.name && p.isPremade == false) as p, index}
						<div
							class="bg-indigo-500 text-white p-2 flex flex-col items-center justify-center rounded-xl transition-all font-semibold"
							on:click={() => prepareCycle(ct.name, p.id)}
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
		</Navcontainer>
	{/if}
</div>
