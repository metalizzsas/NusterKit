<script lang="ts">
	import Flex from '$lib/components/layout/flex.svelte';
	import Button from '$lib/components/button.svelte';

	import { _ } from 'svelte-i18n';
	import { machineData } from '$lib/utils/stores/store';
	import { Linker } from '$lib/utils/stores/linker';
	import Modalcontent from '$lib/components/modals/modalcontent.svelte';

	export let shown: boolean;

	let displayUpdateScreen = false;

	async function triggerUpdate() {
		const req = await fetch('//' + $Linker + '/api/forceUpdate');

		if (req.status == 200) {
			displayUpdateScreen = true;
		}
	}
</script>

<Modalcontent bind:shown title={$_('settings.updateGoing.title')}>
	{#if displayUpdateScreen}
		{#if $machineData.machine.hypervisorData}
			<Flex gap={5} items="center" class="p-4 -mt-4" wrap="wrap">
				{#if $machineData.machine.hypervisorData.overallDownloadProgress !== null}
					<span class="font-semibold">{$_('settings.updateProgress')}</span>
					<div class="rounded-full h-8 p-1 w-1/3 bg-indigo-300">
						<div
							class="h-6 bg-white text-xs rounded-full text-zinc-700 flex flex-row justify-center items-center"
							style="width: {Math.floor(
								$machineData.machine.hypervisorData.overallDownloadProgress ?? 0,
							)}%"
						>
							{#if $machineData.machine.hypervisorData.overallDownloadProgress ?? 0 > 10}
								<span class="font-semibold">
									{Math.floor(
										$machineData.machine.hypervisorData
											.overallDownloadProgress ?? 0,
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
	{:else}
		{$_('settings.updateGoing.desc')}
	{/if}
</Modalcontent>
