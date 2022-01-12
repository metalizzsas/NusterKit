<script lang="ts">
	import '$lib/app.css';
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	export let value: boolean | number;

	const dispatch = createEventDispatcher();

	export let change = () => dispatch('change', { value: value });
</script>

<div
	class="bg-gray-200 w-12 flex flex-row justify-items-end rounded-full p-1 shadow-orange-100 self-center"
	on:click={() => {
		if (typeof value === 'boolean') value = !value;
		else value == 0 ? (value = 1) : (value = 0);
		change();
	}}
>
	{#if value == true}
		<div class="w-6 bg-transparent" transition:fade />
	{/if}
	<div class="w-4 h-4 rounded-full {value ? 'bg-green-500' : 'bg-red-500'}" />
</div>
