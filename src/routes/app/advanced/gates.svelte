<script lang="ts">
	import Toggle from '$lib/components/toggle.svelte';
	import { _ } from 'svelte-i18n';
	import { goto } from '$app/navigation';
	import { Linker } from '$lib/utils/linker';
	import { machineData, lockMachineData } from '$lib/utils/store';
	import { navActions, navBackFunction, navTitle, useNavContainer } from '$lib/utils/navstack';
	import Navcontainer from '$lib/components/navigation/navcontainer.svelte';
	import Navcontainertitle from '$lib/components/navigation/navcontainertitle.svelte';
	import Navcontainersubtitle from '$lib/components/navigation/navcontainersubtitle.svelte';

	$: gates = $machineData.io;

	function update(gate: string, value: number) {
		fetch(`//${$Linker}/api/v1/io/${gate}/${value}`);
	}

	$navTitle = [$_('manual.list'), $_('gates.name')];
	$navBackFunction = () => goto('/app/advanced');
	$navActions = [];
	$useNavContainer = false;
</script>

{#each ['in', 'out'] as bus}
	<Navcontainer>
		<Navcontainertitle>{$_('gates.bus.' + bus)}</Navcontainertitle>
		<div class="flex flex-col">
			{#each gates
				.filter((g) => g.bus == bus)
				.map((io) => {
					let z = io.name.split('-');
					return z[0] == io.name ? 'generic' : gates.filter((h) => h.bus == bus && h.name.startsWith(z[0])).length == 1 ? 'generic' : z[0];
				})
				.sort((a, b) => a.localeCompare(b))
				.filter((i, p, a) => a.indexOf(i) == p)
				.sort((a, b) => (a == 'generic' ? -1 : 1)) as cat}
				{#if gates
					.filter((g) => g.bus == bus)
					.map((io) => {
						let z = io.name.split('-');
						return z[0] == io.name ? 'generic' : gates.filter((h) => h.bus == bus && h.name.startsWith(z[0])).length == 1 ? 'generic' : z[0];
					})
					.sort((a, b) => a.localeCompare(b))
					.filter((i, p, a) => a.indexOf(i) == p)
					.sort((a, b) => (a == 'generic' ? -1 : 1)).length > 1}
					<Navcontainersubtitle>{$_('gates.categories.' + cat)}</Navcontainersubtitle>
				{/if}

				<div class="flex flex-col gap-2 mb-6 last:mb-0">
					{#each gates.filter((g, i, a) => g.bus == bus && (g.name.startsWith(cat) || (cat == 'generic' && gates.filter((h) => h.bus == bus && h.name.startsWith(g.name.split('-')[0])).length == 1) || (cat == 'generic' && g.name.split('-').length == 1))) as output, index}
						<div
							class="text-white flex flex-row justify-between gap-4 bg-zinc-500 py-2 pl-3 pr-2 rounded-xl font-semibold"
						>
							<span class="w-1/3 text-ellipsis">
								{$_('gates.names.' + output.name)}
							</span>
							{#if output.size == 'bit'}
								<Toggle
									bind:value={output.value}
									on:change={(val) => update(output.name, val.detail.value)}
									locked={bus == 'in'}
								/>
							{:else}
								<div class="flex flex-col md:flex-row gap-4 align-center">
									{#if bus == 'out'}
										<input
											type="range"
											min="0"
											max="100"
											on:input={() => {
												$lockMachineData = true;
											}}
											bind:value={output.value}
											on:change={() => {
												$lockMachineData = false;
												update(output.name, output.value);
											}}
										/>
									{/if}

									<span
										class="py-1 px-2 rounded-full bg-white text-gray-800 text-sm"
									>
										{Math.ceil(output.value)} %
									</span>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/each}
		</div>
	</Navcontainer>
{/each}
