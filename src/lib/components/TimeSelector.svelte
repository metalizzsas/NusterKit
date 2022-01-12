<script lang="ts">
	import '$lib/app.css';
	import { onMount } from 'svelte';

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
	<input type="number" class="w-10" min="0" max="59" bind:value={minutes} on:change={update} />
	<div class="px-1 font-semibold inline-block">Minutes :</div>
	<input type="number" class="w-10" min="0" max="59" bind:value={seconds} on:change={update} />
	<div class="px-1 font-semibold inline-block">Secondes</div>
</div>
