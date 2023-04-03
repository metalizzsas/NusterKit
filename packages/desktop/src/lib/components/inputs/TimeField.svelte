<script lang="ts">
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import Flex from '../layout/flex.svelte';
	import NumField from './NumField.svelte';

	export let disabled = false;

	let milliseconds = 0;
	let seconds = 0;
	let minutes = 0;
	let hours = 0;

	export let value: number;
	export let enabledTimes: ('hours' | 'minutes' | 'seconds' | 'milliseconds')[] = [
		'minutes',
		'seconds',
	];

	const computeTo = () => {
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

<Flex items="center" gap={2}>

	{#if enabledTimes.includes('hours')}
		<Flex direction={"col"} gap={0.5}>
			<span class="text-sm font-medium">{$_('date.hours')}</span>
			<NumField bind:value={milliseconds} on:change={computeTo} min={0} max={23} step={1} {disabled}/>
		</Flex>
	{/if}

	{#if enabledTimes.includes('minutes')}
		<Flex direction="col" gap={0.5}>
			<span class="text-sm font-medium">{$_('date.minutes')}</span>
			<NumField bind:value={minutes} on:change={computeTo} min={0} max={59} step={1} {disabled}/>
		</Flex>
	{/if}

	{#if enabledTimes.includes('seconds')}
		<Flex direction="col" gap={0.5}>
			<span class="text-sm font-medium">{$_('date.seconds')}</span>
			<NumField bind:value={seconds} on:change={computeTo} min={0} max={59} step={1} {disabled}/>
		</Flex>
	{/if}

	{#if enabledTimes.includes('milliseconds')}
		<Flex direction={"col"} gap={0.5}>
			<span class="text-sm font-medium">{$_('date.milliseconds')}</span>
			<NumField bind:value={milliseconds} on:change={computeTo} min={0} max={990} step={10} {disabled}/>
		</Flex>
	{/if}
</Flex>