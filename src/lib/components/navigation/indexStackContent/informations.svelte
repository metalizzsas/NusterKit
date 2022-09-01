<script lang="ts">
	import Flex from '$lib/components/layout/flex.svelte';

	import { _ } from 'svelte-i18n';
	import { machineData } from '$lib/utils/store';
	import Label from '$lib/components/label.svelte';

	export let displayUpdateNotes: boolean;

	const data: { key: string; data: string | undefined; func?: () => void }[] = [
		{
			key: 'machine.model',
			data: $_('machines.' + $machineData.machine.model.toLocaleLowerCase()),
		},
		{
			key: 'machine.variant',
			data: $machineData.machine.variant.toUpperCase(),
		},
		{
			key: 'machine.revision',
			data: '' + $machineData.machine.revision,
		},
		{
			key: 'machine.options',
			data: $machineData.machine.options?.join(', '),
		},
		{
			key: 'machine.cycleCount',
			data:
				($machineData.maintenances.find((k) => k.name == 'cycleCount')?.durationActual ??
					'0') + '',
		},
		{
			key: 'machine.nusterVersion',
			data: `${$machineData.machine.nusterVersion} ↗`,
			func: () => {
				displayUpdateNotes = true;
			},
		},
		{
			key: 'machine.balenaVersion',
			data: $machineData.machine.balenaVersion,
		},
		{
			key: 'machine.serial',
			data: $machineData.machine.serial.toLocaleUpperCase(),
		},
	];
</script>

<Flex gap={5} items="center" wrap="wrap" class="p-4">
	{#each data.filter((d) => d.data !== undefined) as element}
		{#if element.func !== undefined}
			<!-- content here -->
			<Label on:click={element.func} class="cursor-pointer">
				<span class="font-semibold">{$_(element.key)}:</span>
				{element.data}
			</Label>
		{:else}
			<Label>
				<span class="font-semibold">{$_(element.key)}:</span>
				{element.data}
			</Label>
		{/if}
	{/each}
</Flex>
