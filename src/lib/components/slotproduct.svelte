<script lang="ts">
	import { _ } from 'svelte-i18n';
	import '$lib/app.css';
	import type { Slot } from '$lib/utils/interfaces';

	export var slotContent: Slot;
</script>

<div class="hover:scale-[1.005]">
	<div
		class="bg-gradient-to-br {$_('slots.colors.' + slotContent.name, {
			default: 'from-indigo-400 to to-indigo-500',
		})} {slotContent.sensors.length > 0 || slotContent.product
			? 'rounded-tr-2xl rounded-tl-2xl'
			: 'rounded-2xl'} transition-all flex flex-row justify-between p-3"
	>
		<span class="text-zinc-800 bg-white font-semibold text-left py-1 px-3 rounded-full">
			{$_('slots.types.' + slotContent.name)}
		</span>
	</div>

	{#if slotContent.sensors.length > 0}
		<div class="bg-white p-3 {slotContent.product ? '' : 'rounded-br-2xl rounded-bl-2xl'}">
			<div class="flex flex-col gap-3">
				{#each slotContent.sensors as s}
					<div
						class="bg-gray-300 pr-1 pl-5 py-1 rounded-full text-neutral-700 font-semibold flex flex-row justify-between items-center"
					>
						{$_('slots.sensors.types.' + s.type)}

						{#if s.type == 'level-a'}
							<span class="bg-gray-900 p-1 px-5 rounded-full text-white">
								{Math.ceil(s.value)} %
							</span>
						{:else if s.type == 'level-np'}
							<div
								class="h-6 w-6 rounded-full {s.value != 1
									? 'bg-red-500 shadow-md shadow-red-300'
									: 'bg-emerald-500 shadow-md shadow-emerald-300'}"
							/>
						{:else if s.type == 'level-min-n'}
							<div
								class="h-6 w-6 rounded-full {s.value != 1
									? 'bg-red-500 shadow-md shadow-red-300'
									: 'bg-emerald-500 shadow-md shadow-emerald-300'}"
							/>
						{:else if s.type == 'level-max-n'}
							<div
								class="h-6 w-6 rounded-full {s.value == 1
									? 'bg-red-500 shadow-md shadow-red-300'
									: 'bg-emerald-500 shadow-md shadow-emerald-300'}"
							/>
						{:else}
							<span class="bg-gray-900 p-1 px-5 rounded-full text-white">
								{Math.ceil(s.value * 100)}
							</span>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
