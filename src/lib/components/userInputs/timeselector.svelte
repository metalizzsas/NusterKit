<script lang="ts">
	import '$lib/app.css';
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';

	export let disabled = false;

	let milliseconds: number = 0;
	let seconds: number = 0;
	let minutes: number = 0;
	let hours: number = 0;

	export let value: number;
	export let enabledTimes: ('hours' | 'minutes' | 'seconds' | 'milliseconds')[] = [
		'minutes',
		'seconds',
	];

	function computeTo() {
		value = milliseconds / 1000 + seconds + minutes * 60 + hours * 3600;
	}

	const computeFrom = () => {
		hours = Math.floor(value / 3600);
		minutes = Math.floor((value - hours * 3600) / 60);
		seconds = Math.floor(value - minutes * 60 - hours * 3600);

		var msInter = value - Math.floor(value);
		milliseconds = Math.ceil(Math.floor(msInter * 10000) / 10);
	};

	onMount(() => {
		computeFrom();
		computeTo();
	});

	$: value, computeFrom();
</script>

<div class="inline-block rounded-full p-1 px-2 bg-white dark:bg-zinc-600">
	{#if enabledTimes.includes('hours')}
		<select
			name="hours"
			class="w-15 bg-white dark:bg-zinc-600"
			bind:value={hours}
			on:change={computeTo}
			{disabled}
		>
			{#each Array.from({ length: 24 }, (_, i) => i + 1).map((x) => x - 1) as count}
				<option value={count}>{count}</option>
				>
			{/each}
		</select>
		<div class="px-1 font-semibold inline-block">{$_('date.hours')}</div>
	{/if}

	{#if enabledTimes.includes('minutes')}
		<select
			class="w-15 bg-white dark:bg-zinc-600"
			name="minutes"
			bind:value={minutes}
			on:change={computeTo}
			{disabled}
		>
			{#each Array.from({ length: 99 }, (_, i) => i + 1).map((x) => x - 1) as count}
				<option value={count}>{count}</option>
				>
			{/each}
		</select>
		<div class="px-1 font-semibold inline-block">{$_('date.minutes')} :</div>
	{/if}

	{#if enabledTimes.includes('seconds')}
		<select
			name="seconds"
			class="w-15 bg-white dark:bg-zinc-600"
			bind:value={seconds}
			on:change={computeTo}
			{disabled}
		>
			{#each Array.from({ length: 60 }, (_, i) => i + 1).map((x) => x - 1) as count}
				<option value={count}>{count}</option>
				>
			{/each}
		</select>
		<div class="px-1 font-semibold inline-block">{$_('date.seconds')}</div>
	{/if}

	{#if enabledTimes.includes('milliseconds')}
		<select
			name="milliseconds"
			class="w-15 bg-white dark:bg-zinc-600"
			bind:value={milliseconds}
			on:change={computeTo}
			{disabled}
		>
			{#each Array.from({ length: 99 }, (_, i) => i + 1)

				.map((x) => x - 1)
				.filter((x) => x % 5 == 0) as count}
				<option value={count * 10}>{count * 10}</option>
				>
			{/each}
		</select>
		<div class="px-1 font-semibold inline-block">{$_('date.milliseconds')}</div>
	{/if}
</div>
