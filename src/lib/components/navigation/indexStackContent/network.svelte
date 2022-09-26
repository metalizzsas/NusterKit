<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { machineData } from '$lib/utils/stores/store';
	import Label from '$lib/components/label.svelte';
	import Modalcontent from '$lib/components/modals/modalcontent.svelte';
	import Flex from '$lib/components/layout/flex.svelte';

	export let shown: boolean;

	const data: { key: string; data: string | string[] | undefined }[] = [
		{
			key: 'machine.ips',
			data: $machineData.machine.deviceData?.ip_address
				.split(' ')
				.filter((k) => k !== '192.168.1.2'),
		},
		{
			key: 'machine.macs',
			data: $machineData.machine.deviceData?.mac_address
				.split(' ')
				.filter(
					(k) =>
						!['E4:5F:01', 'DC:A6:32', '3A:35:41', '28:CD:C1'].includes(
							k.match(/(.{2}\:.{2}\:.{2})/)?.at(0) ?? '',
						),
				),
		},
		{
			key: 'machine.vpn.connected',
			data:
				$machineData.machine.vpnData?.vpn.connected === undefined
					? undefined
					: $_(String($machineData.machine.vpnData?.vpn.connected)),
		},
	];
</script>

<Modalcontent bind:shown title={$_('machine.network_informations')}>
	<table class="table-auto w-full">
		{#each data.filter((d) => d.data !== undefined) as element}
			<tr>
				<td>
					<span class="font-semibold">{$_(element.key)}</span>
				</td>
				<td>
					{#if typeof element.data == 'string'}
						<Label color="bg-zinc-800 text-white">
							{element.data}
						</Label>
					{:else}
						<Flex gap={2} wrap="nowrap">
							{#each element.data as data}
								<Label color="bg-zinc-800 text-white">
									{data}
								</Label>
							{:else}
								<Label color="bg-zinc-800 text-white">
									{element.data}
								</Label>
							{/each}
						</Flex>
					{/if}
				</td>
			</tr>
		{/each}
	</table>
</Modalcontent>

<style>
	td {
		@apply p-2;
	}
</style>
