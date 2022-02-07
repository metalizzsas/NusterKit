<script lang="ts">
	import { _ } from 'svelte-i18n';
	import type { Maintenance } from '$lib/utils/interfaces';
	import { goto } from '$app/navigation';

	export let maintenance: Maintenance;
</script>

<div
	on:click={() => goto('app/maintenance/' + maintenance.name)}
	class="hover:scale-[1.005] cursor-pointer"
>
	<div
		class="p-3 bg-gradient-to-br from-sky-500 to-sky-600 rounded-tr-2xl rounded-tl-2xl overflow-hidden transition-all flex flex-row justify-between"
	>
		<span class="bg-white py-1 px-3 rounded-full text-gray-800 font-semibold">
			{$_('maintenance.tasks.' + maintenance.name + '.name')}
		</span>
		<span class="bg-white py-1 px-3 rounded-full text-gray-600 font-medium">
			{maintenance.durationActual} / {maintenance.durationLimit}
			{maintenance.durationType.charAt(0).toUpperCase() + maintenance.durationType.slice(1)}
		</span>
	</div>

	<div class="bg-white p-3 rounded-br-2xl rounded-bl-2xl">
		<p class=" text-gray-800 text-lg font-medium">
			{$_('maintenance.tasks.' + maintenance.name + '.desc')}
		</p>
	</div>
</div>
