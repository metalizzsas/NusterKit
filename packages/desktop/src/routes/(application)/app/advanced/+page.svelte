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

	import type { IManualHydrated } from "@metalizzsas/nuster-typings/build/hydrated/manual/";
	import Button from '$lib/components/button.svelte';
	import Label from '$lib/components/label.svelte';
	import Flex from '$lib/components/layout/flex.svelte';

	const toggleState = async (name: string, state: number) => {
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

	const computeIncompatibiltyList = (manual: IManualHydrated): Array<IManualHydrated> => {
		if (manual.incompatibility) {
			const incompList = manual.incompatibility.map((m) =>
				$machineData.manuals.find((x) => x.name == m),
			);

			return incompList.filter((x) => x !== undefined && x.state > 0) as Array<IManualHydrated>;
		}
		return [];
	};

	const computeRequiresList = (manual: IManualHydrated): Array<IManualHydrated> => {
		if (manual.requires) {
			const requiresList = manual.requires.map((r) =>
				$machineData.manuals.find((x) => x.name == r),
			);

			return requiresList.filter((x) => x !== undefined && x.state == 0) as Array<IManualHydrated>;
		}
		return [];
	};

	const manualModeLocked = (manual: IManualHydrated): boolean => {
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
		<svelte:component this={index > 0 ? Navcontainertitlesided : Navcontainertitle}>{$_('manual.categories.' + cat)}</svelte:component>

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
									<Flex gap={4} items="center">
										<Label size="small">
											<Flex gap={2} items="center">
												{manual.state}
												<span class="font-medium">{manual.unity}</span>
												<div class="h-3 w-3 rounded-full inline-block" class:bg-red-500={manual.state == 0} class:bg-emerald-500={manual.state != 0}></div>
											</Flex>
										</Label>
										{#if manual.analogScale.min < 0 && !manualModeLocked(manual)}
											<Button size={"small"} on:click={() => toggleState(manual.name, 0)} color={"bg-orange-500"}>{$_('reset')}</Button>
										{/if}
										<input
											type="range"
											class="max-w-[17vw] min-w-[15vw]"
											min={manual.analogScale.min}
											max={manual.analogScale.max}
											bind:value={manual.state}
											on:input|self={(ev) => {
												$lockMachineData = true;
												manual.state = parseInt(ev.currentTarget.value);
											}}
											on:change={async () => {
												$lockMachineData = false;
												await toggleState(manual.name, manual.state);
											}}
											disabled={manualModeLocked(manual)}
										/>
									</Flex>
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
