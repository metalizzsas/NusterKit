<script lang="ts">
	import '$lib/app.css';
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';

	export let disabled = false;

	let seconds: number = 0;
	let minutes: number = 0;

	export let value: number;

	function update() {
		value = minutes * 60 + seconds;
	}

	onMount(() => {
		minutes = Math.floor(value / 60);
		seconds = (Math.floor(value) - minutes * 60) % 60;
	});
</script>

<div class="inline-block rounded-full p-1 px-2 bg-white">
	<select class="w-15" name="minutes" bind:value={minutes} on:change={update} {disabled}>
		{#each Array.from({ length: 99 }, (_, i) => i + 1).map((x) => x - 1) as count}
			<option value={count}>{count}</option>
			>
		{/each}
	</select>

	<div class="px-1 font-semibold inline-block">{$_('minutes')} :</div>

	<select name="seconds" class="w-15" bind:value={seconds} on:change={update} {disabled}>
		{#each Array.from({ length: 60 }, (_, i) => i + 1).map((x) => x - 1) as count}
			<option value={count}>{count}</option>
			>
		{/each}
	</select>
	<div class="px-1 font-semibold inline-block">{$_('seconds')}</div>
</div>
