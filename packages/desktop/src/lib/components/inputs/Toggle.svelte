<script lang="ts">
	import { createEventDispatcher, beforeUpdate } from 'svelte';

	export let value: number | boolean;

	let checked = false;

	const dispatch = createEventDispatcher<{change: {value: boolean }, changeNum: { value: number }}>();

	export let change = () => dispatch('change', { value: value == 1 });
	export let changeNum = () => dispatch('changeNum', { value: value == 1 ? 1 : 0 });

	export let locked = false;
	export let enableGrayScale = false;

	beforeUpdate(() => {
		if (typeof value === 'boolean') checked = value;
		else value == 0 ? (checked = false) : (checked = true);
	});
</script>

<button
	class="dark:bg-white bg-black relative block rounded-full h-6 w-12 min-h-fit min-w-fit toggle"
	class:grayscale={locked && enableGrayScale}
	class:checked={checked}
	class:uncheked={!checked}
	class:cursor-default={locked}
	on:click={() => {
		if (!locked)
		{
			if (typeof value === 'boolean')
			{
				value = !value;
				checked = value;
			} 
			else
			{
				value == 0 ? (value = 1) : (value = 0);
				value == 0 ? (checked = true) : (checked = false);
			}
			change();
			changeNum();
		}
	}}
/>

<style>
	.toggle::before {
		@apply block h-4 w-4 rounded-full;
		content: '';
		position: absolute;
		top: 0.25rem;
		transition: all 0.1s ease-in-out;
	}
	
	.uncheked::before
	{
		@apply bg-red-500;
		left: 0.25rem;
	}

	.checked::before
	{
		@apply bg-emerald-500;
		transform: translateX(1.75rem);
	}
</style>
