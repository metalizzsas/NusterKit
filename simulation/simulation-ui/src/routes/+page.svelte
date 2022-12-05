<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import '$lib/app.css';
	import Chart from '$lib/chart.svelte';
	import Gate from '$lib/gate.svelte';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let showGatesEditable = true;

	onMount(() => {
		setInterval(() => {
			invalidateAll();
		}, 250);
	});
</script>

<div style="background: #eee; margin: 1.5em; padding: 1em; border-radius: 1em;">
	<h1 style="margin: 0.125em;">IOGates</h1>
	<div style="margin: 0.5em 0;">Only show editable gates <input type="checkbox" bind:checked={showGatesEditable} /></div>
	<div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; grid-gap: 1em 1em;">
		{#each data.gates.filter(k => showGatesEditable ? k.bus == "in" : true) as gate}
			<Gate bind:gate />
		{/each}
	</div>
</div>

<div style="background: #eee; margin: 1.5em; padding: 1em; border-radius: 1em;">
	<h1 style="margin: 0.125em;">Chronograms</h1>
	<Chart bind:gates={data.gates} />
</div>
