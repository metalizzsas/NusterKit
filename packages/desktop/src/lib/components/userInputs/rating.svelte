<script lang="ts">
	import Flex from '../layout/flex.svelte';
	import type { GapSizes } from '../layout/flexTypes';

	export let rating: number = 0;
	export let locked: boolean = false;

	export let padding: number = 2;
	export let starsSize: number = 7;
	export let starsGapSize: GapSizes = 3;

	const updateRating = (i: number) => {
		if (locked) return;

		rating == i ? (rating = 0) : (rating = i);
	};
</script>

<Flex
	class="self-center bg-white rounded-full shadow-xs {'p-' + padding} {$$props.class}"
	gap={starsGapSize}
	items={'center'}
>
	{#each [1, 2, 3, 4, 5] as i}
		<svg
			id="glyphicons-basic"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 32 32"
			class="{'h-' + starsSize} {'w-' + starsSize} self-center transition-all {rating >= i
				? 'fill-amber-500'
				: 'fill-gray-500'}"
			on:click={() => updateRating(i)}
		>
			<path
				id="star"
				d="M27.34766,14.17944l-6.39209,4.64307,2.43744,7.506a.65414.65414,0,0,1-.62238.85632.643.643,0,0,1-.38086-.12744l-6.38568-4.6383-6.38574,4.6383a.643.643,0,0,1-.38086.12744.65419.65419,0,0,1-.62238-.85632l2.43744-7.506L4.66046,14.17944A.65194.65194,0,0,1,5.04358,13h7.89978L15.384,5.48438a.652.652,0,0,1,1.24018,0L19.06476,13h7.89978A.652.652,0,0,1,27.34766,14.17944Z"
			/>
		</svg>
	{/each}
</Flex>
