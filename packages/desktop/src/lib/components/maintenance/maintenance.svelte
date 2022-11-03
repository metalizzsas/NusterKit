<script lang="ts">
	import { _ } from 'svelte-i18n';
	import type { IMaintenanceHydrated } from '@metalizzsas/nuster-typings/build/hydrated/maintenance';
	import Maintenancelabel from './maintenancelabel.svelte';
	import Flex from '../layout/flex.svelte';

	export let maintenance: IMaintenanceHydrated;
</script>

<a
	href={`app/maintenance/${maintenance.name}`}
	class="hover:scale-[1.005] cursor-pointer"
>
	<div
		class="p-3 bg-gradient-to-br from-indigo-500 to-indigo-400 rounded-tr-2xl rounded-tl-2xl overflow-hidden transition-all"
	>
		<Flex justify="between" items="center">
			<span class="bg-white py-1 px-3 rounded-full text-gray-800 font-semibold">
				{$_('maintenance.tasks.' + maintenance.name + '.name')}
			</span>
			<Maintenancelabel bind:maintenance/>
		</Flex>
	</div>

	<div class="bg-white p-3 rounded-br-2xl rounded-bl-2xl">
		<p class=" text-gray-800 text-lg font-medium">
			{$_('maintenance.tasks.' + maintenance.name + '.desc')}
		</p>
	</div>
</a>
