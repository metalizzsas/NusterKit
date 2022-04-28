<script lang="ts">
	import '$lib/app.css';

	import Toggle from '$lib/components/toggle.svelte';
	import { _ } from 'svelte-i18n';
	import { machineData, lockMachineData } from '$lib/utils/store';
	import { goto } from '$app/navigation';
	import { Linker } from '$lib/utils/linker';

	async function toggleState(name: string, state: boolean) {
		await fetch(`http://${$Linker}/v1/manual/${name}/${state}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}
</script>

<div class="rounded-xl p-3 pt-0 -m-2 mt-12 bg-neutral-300 dark:bg-neutral-800 shadow-xl group">
	<div class="flex flex-row gap-5 -translate-y-4">
		<div
			on:click={() => goto('/app')}
			class="rounded-full bg-red-400 text-white py-1 px-3 font-semibold flex flex-row gap-2 items-center cursor-pointer"
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
			class="rounded-full bg-indigo-400 text-white py-1 px-8 font-semibold shadow-md group-hover:scale-105 transition-all"
		>
			{$_('manual.list')}
		</div>

		{#if !$machineData.machine.settings.ioControlsMasked}
			<div
				class="rounded-xl bg-orange-400 text-white font-semibold py-1 px-3 shadow-md ml-auto self-end"
				on:click={() => goto('/app/advanced/gates')}
			>
				{$_('gates.name')}
			</div>
		{/if}
	</div>

	<div class="flex flex-col gap-4">
		{#each $machineData.manuals
			.map((mn) => {
				let z = mn.name.split('_');
				return z[0] == mn.name ? 'generic' : $machineData.manuals.filter( (h) => h.name.startsWith(z[0]), ).length == 1 ? 'generic' : z[0];
			})
			.sort((a, b) => a.localeCompare(b))
			.filter((i, p, a) => a.indexOf(i) == p)
			.sort((a, b) => (a == 'generic' ? -1 : 1)) as cat}
			<span class="rounded-full bg-indigo-400 text-white py-1 px-5 font-semibold self-start">
				{$_('manual.categories.' + cat)}
			</span>
			<div class="flex flex-col gap-2">
				{#each $machineData.manuals.filter((g, i, a) => g.name.startsWith(cat) || (cat == 'generic' && $machineData.manuals.filter( (h) => h.name.startsWith(g.name.split('_')[0]), ).length == 1) || (cat == 'generic' && g.name.split('_').length == 1)) as manual, index}
					<div
						class="rounded-xl bg-zinc-700 px-3 py-2 pr-2 pl-3 flex flex-row justify-between items-center"
					>
						<div class="flex flex-col gap-1">
							<span class="text-white font-semibold">
								{$_('manual.tasks.' + manual.name)}
							</span>

							{#if manual.incompatibility
								.map( (i) => $machineData.manuals.find( (j) => (i.startsWith('+') ? j.name == i.substring(1) && j.state == false : j.name == i && j.state == true), ), )
								.filter((x) => x !== undefined).length > 0}
								<span
									class="font-semibold flex flex-row items-center gap-2 text-white text-sm italic"
								>
									{$_('manual.incompatibilities')}:
									<div class="flex flex-row gap-2 not-italic" />
									{#each manual.incompatibility
										.map( (i) => $machineData.manuals.find( (j) => (i.startsWith('+') ? j.name == i.substring(1) && j.state == false : j.name == i && j.state == true), ), )
										.filter((x) => x !== undefined) as mni}
										<span
											class="text-zinc-900 bg-white rounded-full py-[0.5] px-2 text-sm not-italic"
										>
											{$_('manual.tasks.' + mni?.name)}
										</span>
									{/each}
								</span>
							{/if}
						</div>

						{#if manual.analogScale === undefined}
							<Toggle
								bind:value={manual.state}
								on:change={async (e) =>
									await toggleState(manual.name, e.detail.value)}
								enableGrayScale={true}
								locked={manual.incompatibility
									.map((i) =>
										$machineData.manuals.find((j) =>
											i.startsWith('+')
												? j.name == i.substring(1) && j.state == false
												: j.name == i && j.state == true,
										),
									)
									.filter((x) => x !== undefined).length > 0}
							/>
						{:else}
							<div class="flex flex-row items-center gap-4">
								<input
									class="w-[20vw]"
									type="range"
									min={manual.analogScale.min}
									max={manual.analogScale.max}
									bind:value={manual.state}
									on:input={() => {
										$lockMachineData = true;
									}}
									on:change={async (e) => {
										$lockMachineData = false;
										await toggleState(manual.name, manual.state);
									}}
									disabled={manual.incompatibility
										.map((i) =>
											$machineData.manuals.find((j) =>
												i.startsWith('+')
													? j.name == i.substring(1) && j.state == false
													: j.name == i && j.state == true,
											),
										)
										.filter((x) => x !== undefined).length > 0}
								/>
								<span
									class="bg-white rounded-full py-1 text-gray-800 text-xs font-semibold w-16 text-center"
								>
									{manual.state} %
								</span>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/each}
	</div>
</div>
