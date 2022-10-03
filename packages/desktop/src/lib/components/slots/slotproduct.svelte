<script lang="ts">
	import { _ } from 'svelte-i18n';
	import '$lib/app.css';
	import Round from '../round.svelte';
	import Slotmodal from './slotmodal.svelte';
	import Label from '../label.svelte';
	import type { ISlotHydrated } from '@metalizz/nuster-typings/src/hydrated/slot';

	export let slotContent: ISlotHydrated;

	let showModal = false;
</script>

<Slotmodal {slotContent} bind:shown={showModal} />

<div
	class="hover:scale-[1.005]"
	on:click={() => {
		if (slotContent.isProductable) {
			showModal = !showModal;
		}
	}}
>
	<div
		class="bg-gradient-to-br {$_('slots.colors.' + slotContent.name, {
			default: 'from-indigo-400 to to-indigo-500',
		})} {slotContent.sensors.length > 0
			? 'rounded-t-2xl'
			: 'rounded-2xl'} transition-all flex flex-row justify-between p-3 align-middle items-center"
	>
		<span class="text-zinc-800 bg-white font-semibold text-left py-1 px-3 rounded-full">
			{$_('slots.types.' + slotContent.name)}
		</span>
		{#if slotContent.isProductable}
			<Label class="flex flex-row gap-1 items-center">
				<span>{$_('slots.product')}</span>
				{#if slotContent.slotData?.lifetimeRemaining !== undefined}
					{#if slotContent.slotData?.lifetimeRemaining > 0}
						<svg
							id="glyphicons-basic"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 32 32"
							class="h-5 w-5 fill-emerald-500"
						>
							<path
								id="check"
								d="M27.37592,9.70459l-14.151,15.97693a.99985.99985,0,0,1-1.47558.02356L4.59711,18.1322a.99992.99992,0,0,1-.05384-1.31128L5.495,15.63123a.99994.99994,0,0,1,1.22808-.26966L12,18,24.79724,7.09863a.99991.99991,0,0,1,1.35553.0542l1.1817,1.18164A1,1,0,0,1,27.37592,9.70459Z"
							/>
						</svg>
					{:else}
						<svg
							id="glyphicons-basic"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 32 32"
							class="fill-red-500 rotate-45 w-5 h-5"
						>
							<path
								id="plus"
								d="M27,14v4a1,1,0,0,1-1,1H19v7a1,1,0,0,1-1,1H14a1,1,0,0,1-1-1V19H6a1,1,0,0,1-1-1V14a1,1,0,0,1,1-1h7V6a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1v7h7A1,1,0,0,1,27,14Z"
							/>
						</svg>
					{/if}
				{:else}
					<svg
						id="glyphicons-basic"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 32 32"
						class="h-5 w-5 fill-orange-500"
					>
						<path
							id="circle-question"
							d="M16,4A12,12,0,1,0,28,16,12.01312,12.01312,0,0,0,16,4Zm2,18a1,1,0,0,1-1,1H15a1,1,0,0,1-1-1V20a1,1,0,0,1,1-1h2a1,1,0,0,1,1,1Zm2.75-8.88574c0,1.37915-.86694,2.08215-1.95569,2.82495a3.5176,3.5176,0,0,0-1.47369,1.721A.49149.49149,0,0,1,16.84937,18h-2.062a.50188.50188,0,0,1-.49414-.5802,3.26859,3.26859,0,0,1,.65955-1.60095,10.46885,10.46885,0,0,1,2.32751-1.85645,1.0162,1.0162,0,0,0,.46973-.84814V13a1.0013,1.0013,0,0,0-1-1h-1.5a1,1,0,0,0-1,1,1,1,0,0,1-1,1h-1a1,1,0,0,1-1-1,3.99992,3.99992,0,0,1,4-4h1.5c2.28278,0,4,1.16394,4,4Z"
						/>
					</svg>
				{/if}
			</Label>
		{/if}
	</div>

	{#if slotContent.sensors.length > 0}
		<div class="bg-white p-3 rounded-b-2xl">
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
						{:else if ['level-min-n', 'level-np'].includes(s.type)}
							<Round
								size={4}
								margin={1}
								color={s.value == 1 ? 'emerald-500' : 'red-500'}
								shadowColor={s.value == 1 ? 'emerald-300' : 'red-300'}
							/>
						{:else if s.type == 'level-max-n'}
							<Round
								size={4}
								margin={1}
								color={s.value != 1 ? 'emerald-500' : 'red-500'}
								shadowColor={s.value != 1 ? 'emerald-300' : 'red-300'}
							/>
						{:else}
							<span class="bg-gray-900 p-1 px-5 rounded-full text-white">
								{Math.round(s.value * 100) / 100}
								{#if s.unity != undefined}
									{s.unity}
								{/if}
							</span>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
