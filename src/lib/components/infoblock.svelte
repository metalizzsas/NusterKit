<script lang="ts">
	import type { INusterMainInformations } from '$lib/utils/interfaces';
	import { machineData } from '$lib/utils/store';
	import { _ } from 'svelte-i18n';

	export let info: INusterMainInformations;
</script>

<div
	class="rounded-2xl py-2 px-3 bg-gradient-to-br from-rose-300 to-rose-400 text-white font-semibold flex flex-row justify-between"
>
	{#if info.type == 'gate'}
		<div class="font-semibold">{$_('gates.names.' + info.reference)}</div>
		<div>{$machineData.io.find((g) => g.name == info.reference)?.value}</div>
	{:else if info.type == 'maintenance'}
		<div class="font-semibold">{$_('maintenance.tasks.' + info.reference + '.name')}</div>
		<div>
			{$machineData.maintenances.find((m) => m.name == info.reference)?.durationActual}
		</div>
	{/if}
</div>
