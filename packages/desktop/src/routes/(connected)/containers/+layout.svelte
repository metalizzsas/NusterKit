<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import Wrapper from "$lib/components/Wrapper.svelte";
	import SelectableButton from "$lib/components/buttons/SelectableButton.svelte";
	import Flex from "$lib/components/layout/flex.svelte";
	import { computeContainersState } from "$lib/utils/state";
	import { realtime } from "$lib/utils/stores/nuster";
	import { _ } from "svelte-i18n";
	import type { LayoutData } from "./$types";

    export let data: LayoutData;

    $: data.containers = $realtime.containers;

</script>

<Flex direction="row" gap={6}>
	<div class="shrink-0 drop-shadow-xl">
		<Wrapper>
			<Flex direction="col" gap={2}>
				<h1>{$_(`container.lead`)}</h1>
				{#each data.containers as container (container.name)}

					{@const containerState = computeContainersState(container, $realtime.io)}

					<SelectableButton 
						selected={$page.params.id === container.name}
						on:click={() => {if($page.params.id === container.name) { goto("/containers") } else { goto(`/containers/${container.name}`) }}}
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
								<h2>{$_(`containers.${container.name}.name`)}</h2>
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

	<div class="grow drop-shadow-xl">
        <slot />
	</div>
</Flex>