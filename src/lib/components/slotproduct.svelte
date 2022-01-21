<script lang="ts">
	import { _ } from 'svelte-i18n';
	import '$lib/app.css';
	import type { Slot } from '$lib/utils/interfaces';

	export var slotContent: Slot;

	let tr: { [k: string]: string } = {
		'level-a': 'Niveau',
		'level-n': 'Limite',
		temperature: 'temperature',
	};
	//TODO: Use a better way to display sensors
</script>

<div
	class="shadow-xl bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl overflow-hidden hover:scale-[1.01] transition-all"
>
	<div class="backdrop-blur p-3 text-white rounded-full">
		<div class="flex flex-row justify-between">
			<span class="text-zinc-800 bg-white font-semibold text-left py-1 px-3 rounded-full">
				{$_(slotContent.name)}
			</span>
			{#if slotContent.isProductable}
				<span
					class="text-zinc-800 bg-white text-left py-1 px-2 rounded-full"
					on:click={() => {
						return; /*TODO: add window for slot management*/
					}}
				>
					{$_('product')}
				</span>
			{/if}
		</div>

		<div class="mt-1">
			<span class="inline-block my-2 border-b-2 border-white font-semibold text-lg">
				{$_('sensors')}
			</span>
			<div class="grid grid-cols-2 gap-2 items-center">
				{#each slotContent.sensors as s}
					<span class="bg-white px-2 py-1 rounded-full text-neutral-700 font-semibold">
						{$_(s.type)} :
						{#if s.type == 'level-a'}
							{Math.ceil(s.value * 100)} %
						{:else if s.type == 'level-n'}
							{$_(`binary_${s.value == 1}`)}
						{:else}
							{Math.ceil(s.value * 100)}
						{/if}
					</span>
				{/each}
			</div>
		</div>
	</div>
</div>
