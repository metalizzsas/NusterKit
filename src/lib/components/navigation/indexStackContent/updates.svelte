<script lang="ts">
	import Flex from '$lib/components/layout/flex.svelte';
	import Button from '$lib/components/button.svelte';

	import { _ } from 'svelte-i18n';
	import { machineData } from '$lib/utils/store';
	import { Linker } from '$lib/utils/linker';

	export let displayUpdateScreen;
	export let isUpdateShrinked;

	async function triggerUpdate() {
		const req = await fetch('//' + $Linker + '/api/forceUpdate');

		if (req.status == 200) {
			displayUpdateScreen = true;
			isUpdateShrinked = true;
		}
	}
</script>

{#if $machineData.machine.hypervisorData}
	<Flex gap={5} items="center" class="p-4" wrap="wrap">
		{#if $machineData.machine.hypervisorData.overallDownloadProgress !== null}
			<span class="font-semibold">{$_('settings.updateProgress')}</span>
			<div class="rounded-full h-8 p-1 w-1/3 bg-indigo-300">
				<div
					class="h-6 bg-white animate-pulse text-xs rounded-full text-zinc-700 flex flex-row justify-center items-center"
					style="width: {Math.floor(
						$machineData.machine.hypervisorData.overallDownloadProgress ?? 0,
					)}%"
				>
					{#if $machineData.machine.hypervisorData.overallDownloadProgress ?? 0 > 10}
						<span class="font-semibold">
							{Math.floor(
								$machineData.machine.hypervisorData.overallDownloadProgress ?? 0,
							)} %
						</span>
					{/if}
				</div>
			</div>
		{/if}

		{#if $machineData.machine.hypervisorData.appState != 'applied' && $machineData.machine.hypervisorData.overallDownloadProgress == null}
			<Button color="bg-indigo-400" size="small" on:click={triggerUpdate}>
				{$_('settings.triggerUpdate')}
			</Button>
		{/if}
	</Flex>
{/if}
