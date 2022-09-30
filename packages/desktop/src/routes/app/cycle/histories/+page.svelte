<script lang="ts">
	import { date, time, _ } from 'svelte-i18n';
	import { machineData } from '$lib/utils/stores/store';
	import '$lib/app.css';
	import { goto } from '$app/navigation';
	import { Linker } from '$lib/utils/stores/linker';
	import { navTitle } from '$lib/utils/stores/navstack';
	import Modal from '$lib/components/modals/modal.svelte';
	import Rating from '$lib/components/userInputs/rating.svelte';
	import Label from '$lib/components/label.svelte';
	import Button from '$lib/components/button.svelte';
	import Flex from '$lib/components/layout/flex.svelte';
	import Navcontainertitle from '$lib/components/navigation/navcontainertitle.svelte';
	import type { IHistory } from '$lib/utils/interfaces';

	import type { PageData } from './$types';
	export let data: PageData;

	let histories: IHistory[] = data.histories;

	let showRetakeModal = false;
	let selectedHistory: IHistory | null;

	async function restartCycle(his: IHistory) {
		await fetch('//' + $Linker + '/api/v1/cycle/restart/' + his.id, { method: 'POST' });
		goto('/app/cycle/');
	}

	function showRetakeModalHandler(his: IHistory) {
		selectedHistory = his;
		showRetakeModal = true;
	}

	$navTitle = [$_('cycle.button'), $_('cycle.history')];
</script>

<Modal
	title={$_('cycle.histories.retake.title')}
	bind:shown={showRetakeModal}
	buttons={[
		{
			text: $_('yes'),
			color: 'bg-emerald-500',
			callback: async () => {
				if (selectedHistory) await restartCycle(selectedHistory);
			},
		},
		{
			text: $_('cancel'),
			color: 'bg-gray-500',
		},
	]}
>
	{$_('cycle.histories.retake.main')}
</Modal>

<Navcontainertitle>{$_('cycle.history')}</Navcontainertitle>

<Flex direction="col">
	{#each histories as history}
		<Flex class="justify-between bg-zinc-700 p-3 text-white rounded-xl items-center">
			<Flex direction={'col'} gap={0}>
				<span class="font-semibold">{$_('cycle.names.' + history.cycle.name)}</span>
				<span class="italic text-gray-300 font-xs">
					{$date(new Date(history.cycle.status.endDate || 0), {
						format: 'medium',
					})} : {$time(new Date(history.cycle.status.endDate || 0), {
						format: 'medium',
					})}
				</span>
			</Flex>
			<Flex gap={2} class="ml-auto items-center">
				{#if $machineData.machine.settings?.isPrototype == true}
					<Button
						size={'tiny'}
						on:click={() => goto('/app/cycle/histories/' + history.id)}
					>
						See details
					</Button>
				{/if}

				{#if history.cycle.status.endReason != 'finished'}
					<Button
						size="small"
						color="bg-orange-500"
						on:click={() => showRetakeModalHandler(history)}
					>
						{$_('cycle.buttons.resume')}
					</Button>
				{/if}
				<Label
					color={(history.cycle.status.endReason || 'user') == 'finished'
						? 'bg-white text-emerald-500 font-semibold'
						: 'bg-white text-gray-700 font-medium'}
				>
					{$_('cycle.endreasons.' + history.cycle.status.endReason || 'finished')}
				</Label>
				<Rating rating={history.rating} padding={1} starsSize={5} starsGapSize={1} />
			</Flex>
		</Flex>
	{/each}
</Flex>
