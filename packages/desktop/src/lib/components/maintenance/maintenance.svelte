<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { goto } from '$app/navigation';
	import type { IMaintenanceHydrated } from '@metalizzsas/nuster-typings/src/hydrated/maintenance';

	export let maintenance: IMaintenanceHydrated;
</script>

<div
	on:click={() => goto('app/maintenance/' + maintenance.name)}
	class="hover:scale-[1.005] cursor-pointer"
>
	<div
		class="p-3 bg-gradient-to-br from-indigo-500 to-indigo-400 rounded-tr-2xl rounded-tl-2xl overflow-hidden transition-all flex flex-col md:flex-row gap-2 md:gap-0 justify-between"
	>
		<span class="bg-white py-1 px-3 rounded-full text-gray-800 font-semibold">
			{$_('maintenance.tasks.' + maintenance.name + '.name')}
		</span>
		<span class="bg-white py-1 px-3 rounded-full text-gray-600 font-medium">
			{maintenance.durationActual} / {maintenance.durationLimit}
			{$_('maintenance.unity.' + maintenance.durationType)}
		</span>
	</div>

	<div class="bg-white p-3 rounded-br-2xl rounded-bl-2xl">
		<p class=" text-gray-800 text-lg font-medium">
			{$_('maintenance.tasks.' + maintenance.name + '.desc')}
		</p>
	</div>
</div>
