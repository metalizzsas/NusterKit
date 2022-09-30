<script lang="ts">
	import { _ } from 'svelte-i18n';
	import type { Slot } from '$lib/utils/interfaces';
	import Label from '../label.svelte';
	import { Linker } from '$lib/utils/stores/linker';
	import { goto } from '$app/navigation';

	import Actionmodal from '../modals/actionmodal.svelte';
	import Button from '../button.svelte';
	import Flex from '../layout/flex.svelte';

	export let slotContent: Slot;
	export let shown: boolean;

	async function execCTA(cta: any) {
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
			goto(cta.UIEndpoint);
			shown = false;
		}
	}

	export function transformDate(date: number) {
		if (date > 0) {
			const days = new Date(date).getDate() - 1;
			const daysPlural = days != 1 ? $_('date.days') : $_('date.day');
			const hours = new Date(date).getHours();
			const hoursPlural = hours != 1 ? $_('date.hours') : $_('date.hour');

			return days + ' ' + daysPlural + ', ' + hours + ' ' + hoursPlural;
		} else {
			return $_('slots.product.done');
		}
	}
</script>

<Actionmodal bind:shown>
	<Flex direction="col" gap={3}>
		<Flex class="justify-between align-middle items-center">
			<h2 class="text-xl leading-6 text-center">{$_('slots.modal.informations')}</h2>
			<Label
				color="bg-gradient-to-br {$_('slots.colors.' + slotContent.name, {
					default: 'from-indigo-400 to to-indigo-500',
				})} text-white font-semibold"
			>
				{$_('slots.types.' + slotContent.name)}
			</Label>
		</Flex>

		{#if slotContent.productData?.lifetimeRemaining !== undefined && slotContent.productData?.productSeries}
			<Flex gap={1} direction={'col'}>
				{#if slotContent.productData?.productSeries}
					<span>
						{$_('slots.modal.productSeries')}:
						<span class="text-indigo-600 dark:text-indigo-400 font-semibold">
							{slotContent.productData.productSeries.toUpperCase()}
						</span>
					</span>
				{/if}
				{#if slotContent.productData?.lifetimeRemaining !== undefined}
					<span>
						{$_('slots.modal.productLifetime')}:
						<span class="text-indigo-600 dark:text-indigo-400 font-semibold">
							{transformDate(slotContent.productData?.lifetimeRemaining)}
						</span>
					</span>
				{/if}
			</Flex>
		{/if}

		<h2 class="leading-6">{$_('slots.modal.action')}</h2>

		<Flex gap={3} direction={'col'}>
			{#each slotContent.callToAction as cta}
				<Button on:click={async () => await execCTA(cta)}>
					{$_('slots.modal.actions.' + slotContent.name + '.' + cta.name)}
				</Button>
			{/each}
		</Flex>
	</Flex>
</Actionmodal>
