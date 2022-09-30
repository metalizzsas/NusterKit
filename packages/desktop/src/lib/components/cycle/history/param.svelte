<script lang="ts">
	import Button from '$lib/components/button.svelte';
	import Flex from '$lib/components/layout/flex.svelte';
	import type { Param } from '$lib/utils/interfaces';

	export let param: Param;

	let showChildParam = false;
</script>

<Flex direction="col" gap={2}>
	<div class="bg-zinc-500 p-2 rounded-md text-white">
		<Flex direction="col" gap={1}>
			<span class="font-semibold">{param.name} parameter</span>
			{#if param.value !== undefined}
				<span>
					<span class="underline underline-offset-2">Value:</span>
					<span class="italic text-sm">{param.value}</span>
				</span>
			{/if}
			{#if param.data !== undefined}
				<span>
					<span class="underline underline-offset-2">Data:</span>
					<span class="italic text-sm">{param.data}</span>
				</span>
			{/if}

			{#if param.params !== undefined && param.params.length > 0}
				<Button size={'tiny'} on:click={() => (showChildParam = !showChildParam)}>
					Show child params
				</Button>
			{/if}
		</Flex>
	</div>

	{#if showChildParam == true && param.params !== undefined && param.params.length > 0}
		<div class="ml-4">
			<Flex direction="col" gap={2}>
				{#each param.params as param}
					<svelte:self {param} firstLevel={false} />
				{/each}
			</Flex>
		</div>
	{/if}
</Flex>
