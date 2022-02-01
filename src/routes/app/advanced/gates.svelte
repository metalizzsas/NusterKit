<script lang="ts">
	import Toggle from '$lib/components/toggle.svelte';
	import { _ } from 'svelte-i18n';
	import { goto } from '$app/navigation';
	import { Linker } from '$lib/utils/linker';
	import { machineData } from '$lib/utils/store';

	$: gates = $machineData.io;

	function update(gate: string, value: number) {
		fetch(`http://${$Linker}/v1/io/${gate}/${value}`);
	}
</script>

<div class="rounded-xl p-3 pt-0 -m-2 mt-12 bg-neutral-200 dark:bg-neutral-800 shadow-xl group">
	<div class="flex flex-row gap-5 justify-items-end -translate-y-4">
		<div
			on:click={() => goto('/app/advanced')}
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
		</div>
		<div
			class="rounded-xl bg-indigo-500 text-white py-1 px-8 font-semibold shadow-md group-hover:scale-105 transition-all"
		>
			{$_('gates.name')}
		</div>
	</div>

	<div class="grid grid-cols-1 gap-8">
		{#each ['in', 'out'] as bus}
			<div>
				<div class="flex flex-row items-center gap-4">
					<div class="h-0.5 bg-slate-600/10 w-full -translate-y-1" />
					<span
						class="rounded-xl bg-indigo-500 py-1 px-6 text-white font-semibold mb-2 inline-block shadow-xl"
					>
						{$_('gates.bus.' + bus)}
					</span>

					<div class="h-0.5 bg-slate-600/10 w-full -translate-y-1" />
				</div>

				<div class="flex flex-col gap-4">
					{#each gates
						.filter((g) => g.bus == bus)
						.map((io) => {
							let z = io.name.split('-');
							return z[0] == io.name ? 'generic' : gates.filter((h) => h.bus == bus && h.name.startsWith(z[0])).length == 1 ? 'generic' : z[0];
						})
						.sort((a, b) => a.localeCompare(b))
						.filter((i, p, a) => a.indexOf(i) == p)
						.sort((a, b) => (a == 'generic' ? -1 : 1)) as cat}
						<span
							class="rounded-xl bg-sky-600 py-1 px-4 text-white font-semibold self-start"
						>
							{$_('gates.categories.' + cat)}
						</span>
						<div class=" flex flex-col gap-2 last:mb-2">
							{#each gates.filter((g, i, a) => g.bus == bus && (g.name.startsWith(cat) || (cat == 'generic' && gates.filter((h) => h.bus == bus && h.name.startsWith(g.name.split('-')[0])).length == 1) || (cat == 'generic' && g.name.split('-').length == 1))) as output, index}
								<div
									class="text-white flex flex-row justify-between gap-4 bg-zinc-900 py-2 pl-3 pr-2 rounded-xl ring-1 ring-slate-400/10 font-semibold ml-4"
								>
									<span>
										{$_('gates.names.' + output.name)}
									</span>
									{#if output.size == 'bit'}
										<Toggle
											bind:value={output.value}
											on:change={(val) =>
												update(output.name, val.detail.value)}
										/>
									{:else}
										<input
											type="range"
											min="0"
											max="100"
											bind:value={output.value}
											on:change={() => update(output.name, output.value)}
										/>
										<span
											class="py-1 px-2 rounded-full bg-white text-gray-800 text-sm"
										>
											{Math.ceil(output.value)}
										</span>
									{/if}
								</div>
							{/each}
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>
