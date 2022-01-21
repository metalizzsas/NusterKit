<script lang="ts">
	import '$lib/app.css';
	import { createEventDispatcher, beforeUpdate } from 'svelte';
	export let value: boolean | number;

	let aria = false;

	const dispatch = createEventDispatcher();

	export let change = () => dispatch('change', { value: value });

	export let locked = false;
	export let enableGrayScale = false;

	beforeUpdate(() => {
		if (typeof value === 'boolean') aria = value;
		else value == 0 ? (aria = false) : (aria = true);
	});
</script>

<div
	class="toggle {locked && enableGrayScale ? 'grayscale' : ''}"
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
		@apply block rounded-full h-6 w-12 bg-white;
	}

	.toggle::before {
		content: '';
		@apply block bg-red-500 h-4 w-4 rounded-full m-1;
		transition: all 0.1s ease-in-out;
	}

	div[aria-checked='true'].toggle::before {
		@apply bg-green-500;
		transform: translateX(1.5em);
		transition: all 0.1s ease-in-out;
	}
</style>
