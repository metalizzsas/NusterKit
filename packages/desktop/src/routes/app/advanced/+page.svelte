<script lang="ts">
	import '$lib/app.css';

	import Toggle from '$lib/components/userInputs/toggle.svelte';
	import { _ } from 'svelte-i18n';
	import { machineData, lockMachineData } from '$lib/utils/stores/store';
	import { goto } from '$app/navigation';
	import { Linker } from '$lib/utils/stores/linker';
	import {
		navActions,
		navBackFunction,
		navTitle,
		useNavContainer,
	} from '$lib/utils/stores/navstack';
	import NavContainer from '$lib/components/navigation/navcontainer.svelte';
	import { onDestroy } from 'svelte';
	import Navcontainertitle from '$lib/components/navigation/navcontainertitle.svelte';
	import Navcontainertitlesided from '$lib/components/navigation/navcontainertitlesided.svelte';

	import type { ISocketManual } from "@metalizzsas/nuster-typings/build/exchanged/manual/";

	async function toggleState(name: string, state: number) {
		await fetch(`//${$Linker}/api/v1/manual/${name.replace('#', '_')}/${state}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}
	$navTitle = [$_('manual.list')];
	$navBackFunction = () => goto('/app');
	$navActions = $machineData.machine.settings?.ioControlsMasked
		? []
		: [
				{
					label: $_('gates.name'),
					color: 'bg-orange-500',
					action: () => goto('/app/advanced/gates'),
				},
		  ];
	$useNavContainer = false;
	onDestroy(() => {
		$useNavContainer = true;
	});

	const computeIncompatibiltyList = (manual: ISocketManual): Array<ISocketManual> => {
		if (manual.incompatibility) {
			const incompList = manual.incompatibility.map((m) =>
				$machineData.manuals.find((x) => x.name == m),
			);

			return incompList.filter((x) => x !== undefined && x.state > 0) as Array<ISocketManual>;
		}
		return [];
	};

	const computeRequiresList = (manual: ISocketManual): Array<ISocketManual> => {
		if (manual.requires) {
			const requiresList = manual.requires.map((r) =>
				$machineData.manuals.find((x) => x.name == r),
			);

			return requiresList.filter((x) => x !== undefined && x.state == 0) as Array<ISocketManual>;
		}
		return [];
	};

	const manualModeLocked = (manual: ISocketManual): boolean => {
		let incompatibility = true; // if incomp length > 0
		let requires = true;

		if (manual.incompatibility) {
			incompatibility = computeIncompatibiltyList(manual).length > 0;
		} else {
			incompatibility = false;
		}

		if (manual.requires) {
			requires = computeRequiresList(manual).length > 0;
		} else {
			requires = false;
		}

		return !(!incompatibility && !requires && !manual.locked);
	};
</script>

<NavContainer>
	{#each [...new Set($machineData.manuals.map((m) => m.category))] as cat, index}
		{#if index == 0}
			<Navcontainertitle>{$_('manual.categories.' + cat)}</Navcontainertitle>
		{:else}
			<div class="h-4" />
			<Navcontainertitlesided>{$_('manual.categories.' + cat)}</Navcontainertitlesided>
		{/if}

		<div class="flex flex-col gap-2">
			{#each $machineData.manuals.filter((g) => g.category == cat) as manual}
				<div
					class="rounded-xl bg-zinc-500 text-white px-3 py-2 pr-2 pl-3 flex flex-row justify-between items-center"
				>
					<div class="flex flex-col gap-1 w-full">
						<div class="flex flex-row justify-between">
							<span class="font-semibold w-1/3">
								{$_('manual.tasks.' + manual.name)}
								{#if manual.locked}
									<span class="text-sm italic">— {$_('locked')}</span>
								{/if}
							</span>
							<div class="ctrl">
								{#if manual.analogScale === undefined}
									<Toggle
										bind:value={manual.state}
										on:change={async (e) =>
											await toggleState(manual.name, e.detail.value)}
										enableGrayScale={true}
										locked={manualModeLocked(manual)}
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
											disabled={manualModeLocked(manual)}
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
						{#if computeIncompatibiltyList(manual).length > 0}
							<span
								class="font-semibold flex flex-row items-center gap-2 text-white text-sm italic mt-2"
							>
								{$_('manual.incompatibilities')}:
								<div class="flex flex-row gap-2 not-italic" />
								{#each computeIncompatibiltyList(manual) as mni}
									<span
										class="text-zinc-900 bg-white rounded-full py-[0.5] px-2 text-sm not-italic"
									>
										{$_('manual.tasks.' + mni.name)}
									</span>
								{/each}
							</span>
						{/if}
						{#if computeRequiresList(manual).length > 0}
							<span
								class="font-semibold flex flex-row items-center gap-2 text-white text-sm italic mt-2"
							>
								{$_('manual.requires')}:
								<div class="flex flex-row gap-2 not-italic" />
								{#each computeRequiresList(manual) as mnr}
									<span
										class="text-zinc-900 bg-white rounded-full py-[0.5] px-2 text-sm not-italic"
									>
										{$_('manual.tasks.' + mnr.name)}
									</span>
								{/each}
							</span>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/each}
</NavContainer>
