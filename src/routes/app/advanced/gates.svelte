<script context="module" lang="ts">
	export async function load(ctx) {
		let data = await fetch('http://127.0.0.1/v1/io');

		let gates: Io[] = await data.json();

		return { props: { gates: gates } };
	}
</script>

<script lang="ts">
	import HeaderBack from '$lib/components/HeaderBack.svelte';
	import Gate from '$lib/components/Gate.svelte';
	import type { Io } from '$lib/utils/interfaces';

	export let gates: Io[];
</script>

<main>
	<HeaderBack title="Portes entrées sorties" />

	<div id="gatesController">
		{#each gates as g}
			<Gate gate={g} />
		{/each}
	</div>
</main>
