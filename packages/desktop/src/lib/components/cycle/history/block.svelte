<script lang="ts">
	import Button from '$lib/components/button.svelte';
	import Label from '$lib/components/label.svelte';
	import Flex from '$lib/components/layout/flex.svelte';
	import Round from '$lib/components/round.svelte';

	import type { IProgramBlockHydrated } from '@metalizz/nuster-typings/src/hydrated/cycle/blocks/IProgramBlockHydrated';

	import { onMount } from 'svelte';
	import Param from './param.svelte';

	export let block: IProgramBlockHydrated;

	let shrinked = true;

	onMount(() => {
		//TODO fix
		shrinked = block.executed ?? true;
	});
</script>

<Flex direction={'col'} gap={3} class={'ml-4'}>
	<div class="bg-white text-zinc-800 p-2 rounded-xl">
		<!-- Main block container -->
		<Flex gap={4} class="align-middle items-center {shrinked ? '' : 'mb-3'}">
			<Round size={3} color={block.executed ? 'emerald-600' : 'red-600'} />
			<span class="font-semibold text-base">
				{block.name} block
			</span>

			<Button
				size={'tiny'}
				class="ml-auto transition-colors duration-500"
				color={shrinked ? 'bg-indigo-500' : 'bg-red-500'}
				on:click={() => (shrinked = !shrinked)}
			>
				{!shrinked ? 'Shrink' : 'Expand'}
			</Button>
		</Flex>

		{#if !shrinked && block.params != undefined}
			<span class="font-semibold">Parameters</span>

			<div class="w-full overflow-x-scroll mt-3">
				<Flex gap={3}>
					{#each block.params as param}
						<Param {param} />
					{/each}
				</Flex>
			</div>
		{/if}
	</div>

	{#if !shrinked}
		{@const blocks = (block.name == "if") ? [block.blocks, block.trueBlocks, block.falseBlocks] : [block.blocks]}
		{#each blocks as cat, i}
			{@const catego = ['childrens', 'true', 'false']}

			{#if cat !== undefined && cat.length > 0}
				<Label class="ml-4 my-2 self-start font-semibold" color={'bg-zinc-100'}>
					{catego[i]} blocks
				</Label>
				{#each cat as block}
					<svelte:self {block} />
				{/each}
			{/if}
		{/each}
	{/if}
</Flex>
