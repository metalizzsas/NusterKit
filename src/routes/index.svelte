<script lang="ts">
	import Header from '$lib/main/header.svelte';
	import MachineMain from '$lib/nuster/MachineMain.svelte';

	import { selectedMachine } from '$lib/utils/store';
</script>

<main>
	{#if $selectedMachine}
		<MachineMain />
	{:else}
		<Header />
	{/if}
</main>

<style>
	:root {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
			Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
	}

	:global(body) {
		margin: 0;
		padding: 0;
	}

	main {
		padding: 2em 1em 1em 1em;
		text-align: center;
		animation: fade 1s;
		margin: 0 auto;
	}
</style>
