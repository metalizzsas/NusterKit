<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { machineData } from '$lib/utils/stores/store';
	import Label from '$lib/components/label.svelte';
	import Modalcontent from '$lib/components/modals/modalcontent.svelte';
	import Flex from '$lib/components/layout/flex.svelte';
	import ReleasesNotes from './releasesNotes.svelte';

	export let shown: boolean;

	let displayReleaseNotes = false;

	const data: { key: string; data: string | string[] | undefined }[] = [
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
			key: 'machine.serial',
			data: $machineData.machine.serial.toLocaleUpperCase(),
		},
		{
			key: 'machine.options',
			data: $machineData.machine.options,
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
		},
		{
			key: 'machine.balenaVersion',
			data: $machineData.machine.deviceData?.os_version,
		},
	];
</script>

<Modalcontent bind:shown title={$_('machine.informations')}>
	<table class="table-auto w-full">
		{#each data.filter((d) => d.data !== undefined) as element}
			<tr>
				<td>
					<span class="font-semibold">{$_(element.key)}</span>
				</td>
				<td>
					{#if typeof element.data == 'string'}
						<Label
							color="bg-zinc-800 text-white"
							on:click={() => {
								if (element.key == 'machine.nusterVersion') {
									displayReleaseNotes = true;
								}
							}}
						>
							{element.data}
						</Label>
					{:else}
						<Flex gap={2} wrap="nowrap">
							{#each element.data as data}
								<Label color="bg-zinc-800 text-white">
									{data}
								</Label>
							{/each}
						</Flex>
					{/if}
				</td>
			</tr>
		{/each}
	</table>
</Modalcontent>

<ReleasesNotes bind:shown={displayReleaseNotes} />

<style>
	td {
		@apply p-2;
	}
</style>
