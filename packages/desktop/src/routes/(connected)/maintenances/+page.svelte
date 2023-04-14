<script lang="ts">
	import Flex from "$lib/components/layout/flex.svelte";
	import SelectableButton from "$lib/components/buttons/SelectableButton.svelte";
	import Wrapper from "$lib/components/Wrapper.svelte";
	import Maintenance from "./Maintenance.svelte";

	import { _ } from "svelte-i18n";
	import { onMount, setContext } from "svelte";
	import type { PageData } from "./$types";
	import type { MaintenanceHydrated } from "@metalizzsas/nuster-typings/build/hydrated";
	import { writable, type Writable } from "svelte/store";

	export let data: PageData;

	onMount(() => {
		selectedMaintenanceName = data.maintenances.at(0)?.name;
	})

	let selectedMaintenanceName: string | undefined = undefined;
	let selectedMaintenance = setContext<Writable<MaintenanceHydrated | undefined>>("task", writable<MaintenanceHydrated | undefined>(undefined));

	$: selectedMaintenance, selectedMaintenance.set(data.maintenances.find(m => m.name === selectedMaintenanceName));

</script>

<Flex direction="row" gap={6}>
	<div class="shrink-0 overflow-y-scroll drop-shadow-xl">
		<Wrapper>
			<Flex direction="col" gap={2}>
				<h1>{$_(`maintenance.lead`)}</h1>
				{#each data.maintenances as maintenance (maintenance.name)}
					<SelectableButton 
						selected={selectedMaintenanceName === maintenance.name} 
						on:click={() => {
							if(selectedMaintenanceName === maintenance.name) { 
								$selectedMaintenance = undefined;
							} else { 
								selectedMaintenanceName = maintenance.name;
							}
						}}
					>
						<Flex gap={4} items="center">
							<div 
							class="h-3 aspect-square rounded-full" 
							class:bg-emerald-500={maintenance.durationProgress < .75}
							class:bg-amber-500={maintenance.durationProgress >= .75 && maintenance.durationProgress < 1}
							class:bg-red-500={maintenance.durationProgress >= 1}
							/>
							<Flex direction="col" gap={0} items="start" justify="items-start">
								<h2>{$_('maintenance.tasks.' + maintenance.name + '.name')}</h2>
								<p class="text-sm text-zinc-600 dark:text-zinc-300">{maintenance.duration} / {maintenance.durationMax} {$_(`maintenance.unity.${maintenance.durationType}`)}</p>
							</Flex>
						</Flex>
					</SelectableButton>
				{/each}
			</Flex>
		</Wrapper>
	</div>

	<div class="overflow-y-scroll grow drop-shadow-xl">
		<Wrapper>
			{#if $selectedMaintenance !== undefined}
				<Maintenance bind:maintenance={$selectedMaintenance} />
			{:else}
				<h3>{$_('maintenance.unselected.lead')}</h3>
				<p>{$_('maintenance.unselected.sub')}</p>
			{/if}
		</Wrapper>
	</div>
</Flex>