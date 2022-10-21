<script lang="ts">
	import type { ISlotHydrated } from '@metalizzsas/nuster-typings/build/hydrated/slot';
	
	import { _ } from 'svelte-i18n';
	import Label from '../label.svelte';
	import { Linker } from '$lib/utils/stores/linker';
	import { goto } from '$app/navigation';
	import { execCTA } from '$lib/utils/callToAction';

	import Actionmodal from '../modals/actionmodal.svelte';
	import Button from '../button.svelte';
	import Flex from '../layout/flex.svelte';
	import Grid from "../layout/grid.svelte";
	
	import Toggle from '../userInputs/toggle.svelte';

	import Slotmodalload from "./slotmodalload.svelte";
	import Slotregulationchart from './slotregulationchart.svelte';
	import Inputkb from '../userInputs/inputkb.svelte';
	
	import { keyboardShown } from "$lib/utils/stores/keyboard";
	import { lockMachineData } from "$lib/utils/stores/store";
	import type { EProductSeries } from '@metalizzsas/nuster-typings/build/spec/slot/products';
	import { machineData } from "$lib/utils/stores/store";
	import Producttimetrackerrorlabel from './producttimetrackerrorlabel.svelte';

	export let slotContent: ISlotHydrated;
	export let shown: boolean;

	const unloadProduct = async () => {
		if(slotContent.callToAction !== undefined)
		{
			const ctaUnload =  slotContent.callToAction.find(c => c.name == "unload");

			if(ctaUnload !== undefined)
			{
				const ctaResult = await execCTA($Linker, ctaUnload);
				if(ctaResult !== undefined)
				{
					void goto(ctaResult);
					shown = false;
					return;
				}
			}
			else
				void fetch(`//${$Linker}/api/v1/slots/${slotContent.name}/unload/`, { method: 'POST'});
		}
	}

	const setRegulationState = (sensor: string, state: boolean) => {
		void fetch(`//${$Linker}/api/v1/slots/${slotContent.name}/regulation/${sensor.replace("#", "_")}/state/${state === true ? 'true' : 'false'}`, { method: 'POST' });
	}

	const setRegulationTarget = (sensor: string, target: number) => {
		void fetch(`//${$Linker}/api/v1/slots/${slotContent.name}/regulation/${sensor.replace("#", "_")}/target/${target}`, { method: 'POST' });
	}

	export function transformDate(date: number, productseries: EProductSeries = "any") {
		if (date > 0) {

			const years = new Date(date).getFullYear() - 1970;

			const months = new Date(date).getMonth();
			const mappedMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

			const daysToMonths = [...Array(months).keys()].map((_v, i) => mappedMonths[i]).reduce((p, c) => { return p + c }, 0)

			const days = (years * 365) + daysToMonths + new Date(date).getDate() - 1;
			const daysPlural = days != 1 ? $_('date.days') : $_('date.day');
			const hours = new Date(date).getHours();
			const hoursPlural = hours != 1 ? $_('date.hours') : $_('date.hour');

			return `${days} ${daysPlural}, ${hours} ${hoursPlural}`;
		} else if(productseries == "any"){
			return $_('slots.product.unknownLifespan');
		} else {
			return $_('slots.product.done');
		}
	}
	
	let loadProductModalShown = false;

	let regulationModals: Record<string, boolean> = slotContent.sensors.map(s => (s.regulation !== undefined) ? {[s.io.name]: false} : undefined).filter(k => k !== undefined);

	$: if($keyboardShown) { $lockMachineData = true; } else { $lockMachineData = false; }
</script>


<Actionmodal bind:shown>
	<Flex direction="col" gap={4}>
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

		{#if slotContent.productData?.lifetimeRemaining !== undefined && slotContent.productData?.loadedProductType}
			<Flex gap={1} direction={'col'}>
				{#if slotContent.productData?.loadedProductType}
					<span>
						{$_('slots.modal.productSeries')}:
						<span class="text-indigo-600 dark:text-indigo-400 font-semibold">
							{$_(`products.${slotContent.productData.loadedProductType}`)}
						</span>
					</span>
				{/if}
				{#if slotContent.productData?.lifetimeRemaining !== undefined}
					<Flex items="center">
						<span>
							{$_('slots.modal.productLifetime')}:
							<span class="text-indigo-600 dark:text-indigo-400 font-semibold">
								{transformDate(slotContent.productData?.lifetimeRemaining, slotContent.productData.loadedProductType)}
							</span>
	
						</span>
						{#if $machineData.machine.settings?.isNotTimeTracked === true}
							<Producttimetrackerrorlabel />
						{/if}
					</Flex>
				{/if}
			</Flex>
		{/if}

		{#if slotContent.callToAction !== undefined && slotContent.callToAction.filter(c => !c.name.includes("load")).length > 0}
			<div>
				<h2 class="leading-6 mb-2">{$_('slots.modal.action')}</h2>
				<Flex gap={3} direction={'col'}>
					{#each slotContent.callToAction.filter(c => !c.name.includes("load")) as cta}
						<Button on:click={async () => await execCTA($Linker, cta)}>
							{$_('slots.modal.actions.' + slotContent.name + '.' + cta.name)}
						</Button>
					{/each}
				</Flex>
			</div>
		{/if}

		{#if slotContent.supportedProductSeries !== undefined}
			<div>
				<h2 class="leading-6 mb-2">{$_('slots.modal.productManagement')}</h2>
				<Grid gap={4} cols={2}>
					<Button on:click={() => loadProductModalShown = true} color={"bg-emerald-500"}>
						{$_('slots.modal.load')}
					</Button>
					<Button on:click={unloadProduct} color={"bg-red-500"}>
						{$_('slots.modal.unload')}
					</Button>
				</Grid>
			</div>
		{/if}

		{#if slotContent.sensors.filter(ss => ss.regulation !== undefined).length > 0}
			<Flex gap={2} direction="col">
				<h2 class="leading-6">{$_('slots.modal.regulationManagement')}</h2>
				{#each slotContent.sensors.filter(ss => ss.regulation !== undefined) as slotSensor}
					{#if slotSensor.regulation !== undefined && slotSensor.regulation.target !== undefined && slotSensor.regulation.current !== undefined && slotSensor.regulation.state !== undefined}
						<Flex justify="between">
							<h2 class="leading-6 font-medium">{$_('slots.sensors.types.' + slotSensor.type)}</h2>
							<Button size='small' color={'bg-indigo-600'} on:click={() => regulationModals[slotSensor.io.name] = !regulationModals[slotSensor.io.name]}>{$_('slots.regulation.chart.show')} ↗</Button>
						</Flex>
						<Slotregulationchart bind:shown={regulationModals[slotSensor.io.name]} bind:logData={slotSensor.regulation.logData} />
						<Flex items="center">
							{$_('slots.regulation.enabled')}
							<div class="h-[1px] bg-zinc-500 grow"></div>
							<Toggle bind:value={slotSensor.regulation.state} on:change={(e) => setRegulationState(slotSensor.io.name, e.detail.value)}/>
						</Flex>
						<Flex items="center">
							{$_('slots.regulation.current')}<strong>/</strong>{$_(`gates.names.${slotSensor.io.name}`)}
							<div class="h-[1px] bg-zinc-500 grow"></div>
							<Label size="small" class="font-medium">{slotSensor.regulation.current} {slotSensor.io.unity}</Label>
						</Flex>
						<Flex items="center">
							{$_('slots.regulation.target')}
							<div class="h-[1px] bg-zinc-500 grow"></div>
							<Label size="small" class="font-medium">
								<Inputkb bind:value={slotSensor.regulation.target} on:change={(e) => setRegulationTarget(slotSensor.io.name, e.detail.value)} class="bg-transparent"/>
								{slotSensor.io.unity}
							</Label>
						</Flex>					
					{/if}
				{/each}
			</Flex>
		{/if}

	</Flex>
</Actionmodal>

<Slotmodalload bind:shown={loadProductModalShown} bind:slot={slotContent}/>

