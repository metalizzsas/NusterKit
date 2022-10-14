<script lang="ts">
	import { _ } from 'svelte-i18n';
	import Label from '../label.svelte';
	import { Linker } from '$lib/utils/stores/linker';
	import { goto } from '$app/navigation';

	import Actionmodal from '../modals/actionmodal.svelte';
	import type { ISlotHydrated } from "@metalizzsas/nuster-typings/build/hydrated/slot";
	import type { ICallToAction } from '@metalizzsas/nuster-typings/build/spec/nuster/ICallToAction';

	export let slotContent: ISlotHydrated;
	export let shown: boolean;

	const execCTA = async (cta: ICallToAction) => {
		if (cta.APIEndpoint !== undefined) {
			const request = await fetch('//' + $Linker + cta.APIEndpoint.url, {
				method: cta.APIEndpoint.method,
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (request.status !== 200) return;
		}

		if (cta.UIEndpoint !== undefined) {
			void goto(cta.UIEndpoint);
			shown = false;
		}
	}

	export function transformDate(date: number) {
		if (date > 0) {
			const days = new Date(date).getDate() - 1;
			const daysPlural = days != 1 ? $_('date.days') : $_('date.day');
			const hours = new Date(date).getHours();
			const hoursPlural = hours != 1 ? $_('date.hours') : $_('date.hour');

			return `${days} ${daysPlural}, ${hours} ${hoursPlural}`;
		} else {
			return $_('slots.product.done');
		}
	}
</script>

<Actionmodal bind:shown>
	<div class="flex flex-col gap-3">
		<div class="flex flex-row justify-between align-middle items-center">
			<h2 class="text-xl leading-6 text-center">{$_('slots.modal.informations')}</h2>
			<Label
				color="bg-gradient-to-br {$_('slots.colors.' + slotContent.name, {
					default: 'from-indigo-400 to to-indigo-500',
				})} text-white font-semibold"
			>
				{$_('slots.types.' + slotContent.name)}
			</Label>
		</div>
		{#if slotContent.slotData?.lifetimeRemaining !== undefined && slotContent.slotData?.productSeries}
			<div class="flex flex-col gap-1">
				{#if slotContent.slotData?.productSeries}
					<span>
						{$_('slots.modal.productSeries')}:
						<span class="text-indigo-600 dark:text-indigo-400 font-semibold">
							{slotContent.slotData.productSeries.toUpperCase()}
						</span>
					</span>
				{/if}
				{#if slotContent.slotData?.lifetimeRemaining !== undefined}
					<span>
						{$_('slots.modal.productLifetime')}:
						<span class="text-indigo-600 dark:text-indigo-400 font-semibold">
							{transformDate(slotContent.slotData?.lifetimeRemaining)}
						</span>
					</span>
				{/if}
			</div>
		{/if}

		{#if slotContent.callToAction}
			<h2 class="leading-6">{$_('slots.modal.action')}</h2>
			<div class="flex flex-col gap-3">
				{#each slotContent.callToAction as cta}
					<button
						class="rounded-xl py-2 px-5 bg-indigo-600 text-white font-semibold"
						on:click={async () => await execCTA(cta)}
					>
						{$_('slots.modal.actions.' + slotContent.name + '.' + cta.name)}
					</button>
				{/each}
			</div>
		{/if}
	</div>
</Actionmodal>
