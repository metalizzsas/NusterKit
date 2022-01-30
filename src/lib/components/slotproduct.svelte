<script lang="ts">
	import { _ } from 'svelte-i18n';
	import '$lib/app.css';
	import type { Slot } from '$lib/utils/interfaces';

	export var slotContent: Slot;
</script>

<div class="hover:scale-[1.005]">
	<div
		class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-tr-2xl rounded-tl-2xl transition-all flex flex-row justify-between p-3"
	>
		<span class="text-zinc-800 bg-white font-semibold text-left py-1 px-3 rounded-full">
			{$_('slots.types.' + slotContent.name)}
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

	<div class="bg-white p-3 rounded-br-2xl rounded-bl-2xl">
		<div class="flex flex-row items-center justify-around -translate-y-7">
			<span class="bg-purple-500 rounded-xl py-1 px-3 font-semibold shadow-sm text-white">
				{$_('slots.sensors.name')}
			</span>
		</div>
		<div class="flex flex-col gap-3 -mt-3">
			{#each slotContent.sensors as s}
				<div
					class="bg-gray-200 pr-1 pl-5 py-1 rounded-full text-neutral-700 font-semibold flex flex-row justify-between items-center"
				>
					{$_('slots.sensors.types.' + s.type)}
					<span class="bg-gray-900 p-1 px-5 rounded-full text-white">
						{#if s.type == 'level-a'}
							{Math.ceil(s.value)} %
						{:else if s.type == 'level-n'}
							{$_(`binary_${s.value == 1}`)}
						{:else}
							{Math.ceil(s.value * 100)}
						{/if}
					</span>
				</div>
			{/each}
		</div>
	</div>
</div>
