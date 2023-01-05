<script lang="ts">
	import Flex from "$lib/components/layout/flex.svelte";
	import SelectableButton from "$lib/components/buttons/SelectableButton.svelte";
	import { computeContainersState } from "$lib/utils/state";
	import Wrapper from "$lib/components/Wrapper.svelte";
	import { realtime } from "$lib/utils/stores/nuster";
	import type { ContainerHydrated } from "@metalizzsas/nuster-typings/build/hydrated/containers";
	import { _ } from "svelte-i18n";
	import Container from "./Container.svelte";
	import { onMount } from "svelte";

	let selectedContainerName: string | undefined = undefined;
    let selectedContainer: ContainerHydrated | undefined = undefined;

	onMount(() => {
		selectedContainerName = $realtime.containers.at(0)?.name;
	});

	$: selectedContainer = $realtime.containers.find(k => k.name == selectedContainerName);

</script>

<Flex direction="row" gap={6}>
	<div class="shrink-0 overflow-y-scroll drop-shadow-xl">
		<Wrapper>
			<Flex direction="col" gap={2}>
				<h1>{$_(`container.lead`)}</h1>
				{#each $realtime.containers as container (container.name)}

					{@const containerState = computeContainersState(container, $realtime.io)}

					<SelectableButton 
						selected={selectedContainer == container}
						on:click={() => {if(selectedContainerName === container.name) { selectedContainerName = undefined } else { selectedContainerName = container.name }}}
					>
						<Flex gap={4} items="center">
							<div 
								class="h-3 aspect-square rounded-full"
								class:bg-red-500={containerState.result == "error"}
								class:bg-amber-500={containerState.result == "warn"}
								class:bg-emerald-500={containerState.result == "good"}
								class:bg-blue-500={containerState.result == "info"}
							/>
							<Flex direction="col" gap={0} items="start" justify="items-start">
								<h2>{$_('slots.types.' + container.name)}</h2>
								{#if containerState.issues.length > 0}
									{#each containerState.issues as issues}
										<p class="text-sm text-zinc-600 dark:text-zinc-300">{$_(`container.state.issues.${issues}`)}</p>
									{/each}
								{/if}
								{#if containerState.infos.length > 0}
									{#each containerState.infos as info}
										<p class="text-sm text-zinc-600 dark:text-zinc-300">{$_(`container.state.infos.${info}`)}</p>
									{/each}
								{/if}
							</Flex>
						</Flex>
					</SelectableButton>

				{/each}
			</Flex>
		</Wrapper>
	</div>

	<div class="overflow-y-scroll grow drop-shadow-xl">
		<Wrapper>
			{#if selectedContainer !== undefined}
				<Container bind:container={selectedContainer}/>
			{:else}
				<h3>{$_('container.unselected.lead')}</h3>
				<p>{$_('container.unselected.sub')}</p>
			{/if}
		</Wrapper>
	</div>
</Flex>