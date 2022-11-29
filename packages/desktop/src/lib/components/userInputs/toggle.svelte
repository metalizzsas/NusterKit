<script lang="ts">
	import { createEventDispatcher, beforeUpdate } from 'svelte';

	export let value: number | boolean;

	let aria = false;

	const dispatch = createEventDispatcher<{change: {value: boolean | number}}>();

	export let change = () => dispatch('change', { value: value });

	export let locked = false;
	export let enableGrayScale = false;

	beforeUpdate(() => {
		if (typeof value === 'boolean') aria = value;
		else value == 0 ? (aria = false) : (aria = true);
	});
</script>

<div
	class="dark:bg-white bg-black toggle {locked && enableGrayScale ? 'grayscale' : ''}"
	aria-checked={aria}
	on:click={() => {
		if (!locked) {
			if (typeof value === 'boolean') {
				value = !value;
				aria = value;
			} else {
				value == 0 ? (value = 1) : (value = 0);
				value == 0 ? (aria = true) : (aria = false);
			}
			change();
		}
	}}
/>

<style>
	.toggle {
		@apply block rounded-full h-6 w-12 min-h-fit min-w-fit;
		position: relative;
	}

	.toggle::before {
		content: '';
		position: absolute;
		top: 0.25rem;
		left: 0.25rem;
		@apply block bg-red-500 h-4 w-4 rounded-full;
		transition: all 0.1s ease-in-out;
	}

	div[aria-checked='true'].toggle::before {
		@apply bg-green-500;
		top: 0.25rem;
		right: 0.25rem;
		transform: translateX(1.5rem);
		transition: all 0.1s ease-in-out;
	}
</style>
