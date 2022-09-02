<script lang="ts">
	import { Linker } from '$lib/utils/stores/linker';
	import { _ } from 'svelte-i18n';
	function prepareCycle(cycleType: string, profileID: string) {
		fetch('//' + $Linker + '/api/v1/cycle/' + cycleType + '/' + profileID, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				host: $Linker,
			},
		});
	}

	export let ct: { name: string; profile: string; cycle: string };
</script>

<div
	class="bg-indigo-900 text-white rounded-xl transition-all font-semibold cursor-pointer hover:scale-[1.005]"
	on:click={() => prepareCycle(ct.cycle, ct.profile)}
>
	<div class="flex flex-row gap-4 items-center justify-items-start">
		<img
			src="//{$Linker}/api/assets/cycle/{ct.name}.png"
			class="aspect-square bg-white rounded-l-xl w-16"
			alt="illutration cycle"
		/>
		<div class="text-md">{$_('cycle.types.' + ct.name)}</div>
	</div>
</div>
