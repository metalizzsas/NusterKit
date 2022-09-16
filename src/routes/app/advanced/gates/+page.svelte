<script lang="ts">
	import Toggle from '$lib/components/userInputs/toggle.svelte';
	import { _ } from 'svelte-i18n';
	import { goto } from '$app/navigation';
	import { Linker } from '$lib/utils/stores/linker';
	import { machineData, lockMachineData } from '$lib/utils/stores/store';
	import {
		navActions,
		navBackFunction,
		navTitle,
		useNavContainer,
	} from '$lib/utils/stores/navstack';
	import Navcontainer from '$lib/components/navigation/navcontainer.svelte';
	import Navcontainertitle from '$lib/components/navigation/navcontainertitle.svelte';
	import Navcontainertitlesided from '$lib/components/navigation/navcontainertitlesided.svelte';

	$: gates = $machineData.io;

	function update(gate: string, value: number) {
		fetch(`//${$Linker}/api/v1/io/${gate.replace('#', '_')}/${value}`);
	}

	$navTitle = [$_('manual.list'), $_('gates.name')];
	$navBackFunction = () => goto('/app/advanced');
	$navActions = [];
	$useNavContainer = false;

	let tab = 'in';
</script>

<Navcontainer>
	<div class="grid grid-cols-2 gap-4">
		<div
			on:click={() => (tab = 'in')}
			class=" bg-gradient-to-br {tab == 'in'
				? 'from-indigo-500 to-indigo-600'
				: 'from-gray-500 to-gray-600'}  py-3 px-5 text-white font-semibold rounded-xl text-center transition-all hover:opacity-90 duration-200 ease-in-out cursor-pointer"
		>
			<div class="flex flex-row self-center gap-2 justify-center w-full">
				<svg
					id="glyphicons-basic"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 32 32"
					class="h-5 w-5 fill-white self-center"
				>
					<path
						id="square-download"
						d="M27,8.5v15A3.50424,3.50424,0,0,1,23.5,27H8.5A3.50424,3.50424,0,0,1,5,23.5V8.5A3.50424,3.50424,0,0,1,8.5,5h4.13293l-.407,3H8.5a.50641.50641,0,0,0-.5.5v15a.50641.50641,0,0,0,.5.5h15a.50641.50641,0,0,0,.5-.5V8.5a.50641.50641,0,0,0-.5-.5H19.77411l-.407-3H23.5A3.50424,3.50424,0,0,1,27,8.5ZM11.18994,13.82385l3.98859,5.74628a.99994.99994,0,0,0,1.64294,0l3.98859-5.74628a1,1,0,0,0-.82147-1.57019H18.2467l-1.20849-9.5415a.5.5,0,0,0-.49829-.4585H15.46008a.5.5,0,0,0-.49829.4585l-1.20849,9.5415H12.01141A1,1,0,0,0,11.18994,13.82385Z"
					/>
				</svg>

				{$_('gates.bus.in')}
			</div>
		</div>
		<div
			on:click={() => (tab = 'out')}
			class=" bg-gradient-to-br {tab == 'out'
				? 'from-indigo-500 to-indigo-600'
				: 'from-gray-500 to-gray-600'} py-3 px-5 text-white font-semibold rounded-xl text-center transition-all hover:opacity-90 duration-200 ease-in-out cursor-pointer"
		>
			<div class="flex flex-row self-center gap-2 justify-center w-full">
				<svg
					id="glyphicons-basic"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 32 32"
					class="h-5 w-5 fill-white self-center"
				>
					<path
						id="square-upload"
						d="M27,8.5v15A3.50424,3.50424,0,0,1,23.5,27H8.5A3.50424,3.50424,0,0,1,5,23.5V8.5A3.50424,3.50424,0,0,1,8.5,5h2.63623L9.54785,7.28809A3.009,3.009,0,0,0,9.18549,8H8.5a.50641.50641,0,0,0-.5.5v15a.50641.50641,0,0,0,.5.5h15a.50641.50641,0,0,0,.5-.5V8.5a.50641.50641,0,0,0-.5-.5h-.6853a3.00838,3.00838,0,0,0-.36158-.71094L20.86407,5H23.5A3.50424,3.50424,0,0,1,27,8.5ZM12.01141,10H13.7533l1.20849,9.5415A.5.5,0,0,0,15.46008,20H16.54a.5.5,0,0,0,.49823-.4585L18.2467,10h1.74189a1,1,0,0,0,.82147-1.57019L16.82153,2.68353a1,1,0,0,0-1.643,0L11.18994,8.42981A1,1,0,0,0,12.01141,10Z"
					/>
				</svg>

				{$_('gates.bus.out')}
			</div>
		</div>
	</div>
</Navcontainer>

<Navcontainer>
	{#each [...new Set(gates.filter((g) => g.bus == tab).map((g) => g.category))] as cat, index}
		{#if index > 0}
			<Navcontainertitlesided>{$_('gates.categories.' + cat)}</Navcontainertitlesided>
		{:else}
			<Navcontainertitle>{$_('gates.categories.' + cat)}</Navcontainertitle>
		{/if}

		<div class="flex flex-col gap-2 mb-6 last:mb-0">
			{#each gates.filter((g) => g.bus == tab && g.category == cat) as gate, index}
				<div
					class="text-white flex flex-row justify-between gap-4 bg-zinc-500 py-2 pl-3 pr-2 rounded-xl font-semibold"
				>
					<span class="w-1/3 text-ellipsis">
						{$_('gates.names.' + gate.name)}
					</span>
					{#if gate.size == 'bit'}
						<Toggle
							bind:value={gate.value}
							on:change={(val) => update(gate.name, val.detail.value)}
							locked={tab == 'in'}
						/>
					{:else}
						<div class="flex flex-col md:flex-row gap-4 align-center">
							{#if tab == 'out'}
								<input
									type="range"
									min="0"
									max="100"
									on:input={() => {
										$lockMachineData = true;
									}}
									bind:value={gate.value}
									on:change={() => {
										$lockMachineData = false;
										update(gate.name, gate.value);
									}}
								/>
							{/if}

							<span class="py-1 px-2 rounded-full bg-white text-gray-800 text-sm">
								{Math.ceil(gate.value)}
								{#if gate.unity != undefined}
									{gate.unity}
								{/if}
							</span>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/each}
</Navcontainer>
