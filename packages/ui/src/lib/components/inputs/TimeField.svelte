<script lang="ts">
	import { onMount } from 'svelte';
	import { _ } from 'svelte-i18n';
	import Flex from '../layout/flex.svelte';
	import NumField from './NumField.svelte';

	let {
		disabled = false,
		value = $bindable(),
		enabledTimes = undefined,
	}: {
		disabled?: boolean;
		value: number;
		enabledTimes?: ('hours' | 'minutes' | 'seconds' | 'milliseconds')[];
	} = $props();

	let milliseconds = $state(0);
	let seconds = $state(0);
	let minutes = $state(0);
	let hours = $state(0);

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

	$effect(() => {
		void value;
		computeFrom();
	});
</script>

<Flex items="center" gap={2}>

	{#if enabledTimes?.includes('hours')}
		<Flex direction={"col"} gap={0.5}>
			<span class="text-sm font-medium">{$_('date.hours')}</span>
			<NumField bind:value={milliseconds} change={computeTo} min={0} max={23} step={1} {disabled}/>
		</Flex>
	{/if}

	{#if enabledTimes === undefined || enabledTimes?.includes('minutes')}
		<Flex direction="col" gap={0.5}>
			<span class="text-sm font-medium">{$_('date.minutes')}</span>
			<NumField bind:value={minutes} change={computeTo} min={0} max={59} step={1} {disabled}/>
		</Flex>
	{/if}

	{#if enabledTimes === undefined || enabledTimes?.includes('seconds')}
		<Flex direction="col" gap={0.5}>
			<span class="text-sm font-medium">{$_('date.seconds')}</span>
			<NumField bind:value={seconds} change={computeTo} min={0} max={59} step={1} {disabled}/>
		</Flex>
	{/if}

	{#if enabledTimes?.includes('milliseconds')}
		<Flex direction={"col"} gap={0.5}>
			<span class="text-sm font-medium">{$_('date.milliseconds')}</span>
			<NumField bind:value={milliseconds} change={computeTo} min={0} max={990} step={10} {disabled}/>
		</Flex>
	{/if}
</Flex>
