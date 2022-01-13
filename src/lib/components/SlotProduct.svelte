<script lang="ts">
	import '$lib/app.css';
	import type { Slot } from '$lib/utils/interfaces';

	export let slot: Slot;
</script>

<div
	class="shadow-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl overflow-hidden"
>
	<div class="backdrop-blur p-3 text-white">
		<div class="flex flex-row justify-between">
			<span class="text-zinc-800 bg-white font-semibold text-left py-1 px-2 rounded-full">
				{slot.name}
			</span>
			<span
				class="text-zinc-800 bg-white font-semibold text-left py-1 px-2 rounded-full"
				on:click={() => {
					return; /*TODO: add window for slot management*/
				}}
			>
				>
			</span>
		</div>

		<div class="absolute left-0 bottom-0 font-black text-7xl opacity-10 uppercase">
			{slot.type}
		</div>
	</div>
</div>
