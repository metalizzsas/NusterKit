<script lang="ts">
	import '$lib/app.css';

	import Toggle from '$lib/components/toggle.svelte';
	import { _ } from 'svelte-i18n';
	import { machineData, lockMachineData } from '$lib/utils/store';
	import { goto } from '$app/navigation';
	import { Linker } from '$lib/utils/linker';
	import { navActions, navBackFunction, navTitle, useNavContainer } from '$lib/utils/navstack';
	import NavContainer from '$lib/components/navigation/navcontainer.svelte';
	import { onDestroy } from 'svelte';
	import Navcontainertitle from '$lib/components/navigation/navcontainertitle.svelte';

	async function toggleState(name: string, state: number) {
		await fetch(`//${$Linker}/api/v1/manual/${name}/${state}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}
	$navTitle = [$_('manual.list')];
	$navBackFunction = () => goto('/app');
	$navActions = $machineData.machine.settings.ioControlsMasked
		? []
		: [
				{
					label: $_('gates.name'),
					class: 'py-1 px-3 bg-orange-500 text-white rounded-xl text-sm font-semibold',
					action: () => goto('/app/advanced/gates'),
				},
		  ];
	$useNavContainer = false;
	onDestroy(() => {
		$useNavContainer = true;
	});
</script>

{#each $machineData.manuals
	.map((mn) => {
		let z = mn.name.split('_');
		return z[0] == mn.name ? 'generic' : $machineData.manuals.filter( (h) => h.name.startsWith(z[0]), ).length == 1 ? 'generic' : z[0];
	})
	.sort((a, b) => a.localeCompare(b))
	.filter((i, p, a) => a.indexOf(i) == p)
	.sort((a, b) => (a == 'generic' ? -1 : 1)) as cat}
	<NavContainer>
		<Navcontainertitle>{$_('manual.categories.' + cat)}</Navcontainertitle>
		<div class="flex flex-col gap-2">
			{#each $machineData.manuals.filter((g, i, a) => g.name.startsWith(cat) || (cat == 'generic' && $machineData.manuals.filter( (h) => h.name.startsWith(g.name.split('_')[0]), ).length == 1) || (cat == 'generic' && g.name.split('_').length == 1)) as manual, index}
				<div
					class="rounded-xl bg-zinc-500 text-white px-3 py-2 pr-2 pl-3 flex flex-row justify-between items-center"
				>
					<div class="flex flex-col gap-1 w-full">
						<div class="flex flex-row justify-between">
							<span class="font-semibold w-1/3">
								{$_('manual.tasks.' + manual.name)}
							</span>
							<div class="ctrl">
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
														? j.name == i.substring(1) && j.state == 0
														: j.name == i && j.state == 1,
												),
											)
											.filter((x) => x !== undefined).length > 0}
									/>
								{:else}
									<div
										class="flex flex-col md:flex-row items-center gap-1 md:gap-4"
									>
										<input
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
															? j.name == i.substring(1) &&
															  j.state == 0
															: j.name == i && j.state == 1,
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
						</div>
						{#if manual.incompatibility
							.map( (i) => $machineData.manuals.find( (j) => (i.startsWith('+') ? j.name == i.substring(1) && j.state == 0 : j.name == i && j.state == 1), ), )
							.filter((x) => x !== undefined).length > 0}
							<span
								class="font-semibold flex flex-row items-center gap-2 text-white text-sm italic mt-2"
							>
								{$_('manual.incompatibilities')}:
								<div class="flex flex-row gap-2 not-italic" />
								{#each manual.incompatibility
									.map( (i) => $machineData.manuals.find( (j) => (i.startsWith('+') ? j.name == i.substring(1) && j.state == 0 : j.name == i && j.state == 1), ), )
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
				</div>
			{/each}
		</div>
	</NavContainer>
{/each}
