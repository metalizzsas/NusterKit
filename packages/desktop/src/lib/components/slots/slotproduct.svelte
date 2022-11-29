<script lang="ts">
	import type { ISlotHydrated } from '@metalizzsas/nuster-typings/build/hydrated/slot';

	import { _ } from 'svelte-i18n';
	import Round from '../round.svelte';
	import Slotmodal from './slotmodal.svelte';
	import Label from '../label.svelte';
	import Flex from '../layout/flex.svelte';

	export let slotContent: ISlotHydrated;

	let showModal = false;
</script>

<Slotmodal {slotContent} bind:shown={showModal} />

<div
	class="hover:scale-[1.005]"
	on:click={() => {
		if (
			slotContent.isProductable ||
			slotContent.sensors.map((k) => k.regulation !== undefined).reduce((c, p) => c || p)
		) {
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
			<Label class="flex flex-row gap-1 items-center" color={'bg-white text-zinc-800'}>
				{#if slotContent.productData?.lifetimeRemaining !== undefined && slotContent.productData?.loadedProductType != 'any'}
					<span>{$_(`products.${slotContent.productData.loadedProductType}`)}</span>
					{#if slotContent.productData?.lifetimeRemaining > 0}
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
					<span>{$_('slots.product.title')}</span>
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
		<div class="bg-white dark:bg-neutral-700 p-3 rounded-b-2xl">
			<Flex direction={'col'} gap={3}>
				{#each slotContent.sensors as s}
					<Flex direction="col" gap={2}>
						<Label color={"text-white bg-zinc-400 dark:bg-zinc-500"}>
							<Flex justify="between">
								{$_('slots.sensors.types.' + s.type)}
								{#if s.type == 'level-a'}
									<span class="bg-gray-900 p-1 px-5 rounded-full text-white">
										{Math.ceil(s.io.value)} %
									</span>
								{:else if ['level-min-n', 'level-np'].includes(s.type)}
									<Round
										size={4}
										margin={1}
										color={s.io.value == 1 ? 'emerald-500' : 'red-500'}
										shadowColor={s.io.value == 1 ? 'emerald-300' : 'red-300'}
									/>
								{:else if s.type == 'level-max-n'}
									<Round
										size={4}
										margin={1}
										color={s.io.value != 1 ? 'emerald-500' : 'red-500'}
										shadowColor={s.io.value != 1 ? 'emerald-300' : 'red-300'}
									/>
								{:else}
									<span>
										{Math.round(s.io.value * 100) / 100}
										{#if s.io.unity != undefined}
											{s.io.unity}
										{/if}
									</span>
								{/if}
							</Flex>
						</Label>
	
						{#if s.regulation}
							<Label size="small" color={"text-white bg-zinc-400 dark:bg-zinc-500"} class="self-center">{$_('slots.modal.regulationManagement')}</Label>
							<Flex gap={0.5} direction="col" class="text-md">
								<Flex gap={2} items="center">
									{$_('slots.regulation.enabled')}
									<div class="h-[1px] bg-zinc-400 grow" />
									<Round
										size={4}
										margin={1}
										color={s.regulation.state ? 'emerald-500' : 'red-500'}
										shadowColor={s.regulation.state ? 'emerald-300' : 'red-300'}
									/>
								</Flex>
								<Flex gap={2} items="center">
									{$_('slots.regulation.target')}
									<div class="h-[1px] bg-zinc-400 grow" />
									<Label size="small" class="font-semibold">{s.regulation.target} {s.io.unity}</Label>
								</Flex>
							</Flex>
						{/if}
					</Flex>
				{/each}
			</Flex>
		</div>
	{/if}
</div>
