<script lang="ts">
	import { navigating } from '$app/stores';
	import { fly } from 'svelte/transition';

	let isNavigating = $derived($navigating != null);

	const delay = (): Promise<void> => { return new Promise<void>(resolve => setTimeout(resolve, 250)) };
</script>

{#if isNavigating}
	{#await delay() then}
		<div
			class="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent loading-shimmer z-50"
			in:fly
			out:fly
		></div>
	{/await}
{/if}

<style>
	@keyframes loading-shimmer-move {
		0% {
			background-position: -100% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}

	.loading-shimmer {
		background-size: 50% 100%;
		background-repeat: no-repeat;
		animation: loading-shimmer-move 1.5s linear infinite;
	}
</style>
