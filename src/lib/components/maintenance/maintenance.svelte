<script lang="ts">
	import type { Maintenance } from '$lib/utils/interfaces';

	export let maintenance: Maintenance;
</script>

<div
	class="shadow-xl p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl overflow-hidden hover:scale-[1.01] transition-all"
>
	<div class="flex flex-row justify-between items-center">
		<span class="bg-white py-1 px-3 rounded-full text-gray-600 font-semibold">
			{maintenance.name}
		</span>
		<span class="bg-white py-1 px-3 rounded-full text-gray-600">
			{maintenance.durationActual} / {maintenance.durationLimit}
			{maintenance.durationType.charAt(0).toUpperCase() + maintenance.durationType.slice(1)}
		</span>
	</div>

	<p class="py-2 text-white text-lg">{maintenance.name}-desc</p>

	<div class="flex flex-row justify-center mt-7">
		<a
			href="app/maintenance/{maintenance.name}"
			class="bg-white py-2 px-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-100/100 transition-all"
		>
			Voir le detail
		</a>
	</div>
</div>
