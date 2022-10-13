<script lang="ts">
	import { navigating } from '$app/stores';
	import { fly } from 'svelte/transition';

	let overtime = false;

	let timeoutTimer: ReturnType<typeof setTimeout> | null = null;

	$: if ($navigating != null) {
		timeoutTimer = setTimeout(() => {
			overtime = true;
		}, 250);
	}
	$: if ($navigating == null) {
		if (timeoutTimer !== null) clearTimeout(timeoutTimer);
		overtime = false;
	}

	$: $navigating == null, (overtime = false);
</script>

{#if overtime}
	<div
		class="fixed top-0 left-0 right-0 h-[6px] bg-gradient-to-r from-indigo-500 to-fuchsia-500 via-orange-500 hue-rotate duration-300"
		in:fly
		out:fly
	/>
{/if}

<style>
	@keyframes gradientMove {
		0% {
			background-position: 10% 0%;
		}
		50% {
			background-position: 91% 100%;
		}
		100% {
			background-position: 10% 0%;
		}
	}

	.hue-rotate {
		background-size: 200%;
		animation: gradientMove infinite 2.5s ease-in-out;
	}
</style>
