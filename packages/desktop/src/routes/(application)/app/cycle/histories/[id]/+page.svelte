<script lang="ts">
	import Flex from '$lib/components/layout/flex.svelte';
	import Navcontainersubtitle from '$lib/components/navigation/navcontainersubtitle.svelte';
	import Navcontainertitle from '$lib/components/navigation/navcontainertitle.svelte';
	import Rating from '$lib/components/userInputs/rating.svelte';
	import Block from '$lib/components/cycle/history/block.svelte';
	import Label from '$lib/components/label.svelte';
	import Profilemodal from '$lib/components/cycle/history/profilemodal.svelte';
	import Button from '$lib/components/button.svelte';

	import type { PageData } from './$types';
	import Navcontainer from '$lib/components/navigation/navcontainer.svelte';
	export let data: PageData;

	let showProfile = false;
</script>

<Profilemodal bind:shown={showProfile} profile={data.history.profile} />

<Navcontainer>
	<Navcontainertitle>Cycle details</Navcontainertitle>
	<Flex direction="col" gap={3} class="mb-6">
		<Flex class="items-center align-center">
			Rating
			<Rating rating={data.history.rating} locked={true} />
		</Flex>
	
		<Button on:click={() => (showProfile = true)} class="self-start" color={'bg-zinc-600'}>
			Show profile
		</Button>
	</Flex>
	
	<Navcontainertitle sided={true}>Cycle steps</Navcontainertitle>
	<Flex direction="col" gap={2}>
		{#each data.history.cycle.steps as step, i}
			<Navcontainersubtitle class="self-start mb-0">{i} — {step.name}</Navcontainersubtitle>
			<Flex direction={'col'} gap={2}>
				{#each [step.startBlocks, step.blocks, step.endBlocks] as cat, i}
					{@const catego = ['start', 'run', 'end']}
	
					{#if cat.length > 0}
						<Label class="ml-4 my-2 self-start font-semibold text-sm" color={'bg-zinc-100'}>
							{catego[i]} step blocks
						</Label>
	
						{#each cat as block}
							<Block {block} />
						{/each}
					{/if}
				{/each}
			</Flex>
		{/each}
	</Flex>
</Navcontainer>