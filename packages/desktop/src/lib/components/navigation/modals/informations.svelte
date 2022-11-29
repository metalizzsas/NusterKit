<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { machineData } from '$lib/utils/stores/store';
	import Label from '$lib/components/label.svelte';
	import Modalcontent from '$lib/components/modals/modal.svelte';
	import Flex from '$lib/components/layout/flex.svelte';
	import ReleasesNotes from './releasesNotes.svelte';

	export let shown: boolean;

	let displayDesktopReleaseNotes = false;
	let displayTurbineReleaseNotes = false;

	let data: { key: string; data: string | string[] | undefined }[] = []; 
	
	$: shown, data = [
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
			data: `${$machineData.machine.revision}`,
		},
		{
			key: 'machine.serial',
			data: $machineData.machine.serial.toLocaleUpperCase(),
		},
		{
			key: 'machine.addons',
			data: $machineData.machine.addons,
		},
		{
			key: 'machine.machineAddons',
			data: $machineData.machine.machineAddons?.map((a) => a.addonName),
		},
		{
			key: 'machine.cycleCount',
			data: `${$machineData.maintenances.find((k) => k.name == 'cycleCount')?.duration ?? 0}`,
		},
		{
			key: 'machine.nusterDesktopVersion',
			data: `${$_('settings.updateNotes.main')} ↗`,
		},
		{
			key: 'machine.nusterTurbineVersion',
			data: `${$_('settings.updateNotes.main')} ↗`,
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
								if (element.key == 'machine.nusterDesktopVersion') {
									displayDesktopReleaseNotes = true;
								} else if (element.key == 'machine.nusterTurbineVersion') {
									displayTurbineReleaseNotes = true;
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

<ReleasesNotes bind:shown={displayTurbineReleaseNotes} type={'turbine'} />
<ReleasesNotes bind:shown={displayDesktopReleaseNotes} type={'desktop'} />

<style>
	td {
		@apply p-2;
	}
</style>
