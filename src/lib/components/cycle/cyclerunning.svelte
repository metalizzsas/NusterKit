<script lang="ts">
	import { Linker } from '$lib/utils/stores/linker';
	import { machineData } from '$lib/utils/stores/store';
	import { navTitle, useNavContainer } from '$lib/utils/stores/navstack';
	import { parseTime } from '$lib/utils/dateparser';

	import { _ } from 'svelte-i18n';
	import { onMount } from 'svelte';

	import Navcontainertitle from '../navigation/navcontainertitle.svelte';
	import Navcontainer from '../navigation/navcontainer.svelte';
	import Navcontainertitlesided from '../navigation/navcontainertitlesided.svelte';
	import Button from '../button.svelte';
	import Flex from '../layout/flex.svelte';
	import Cyclestep from './cyclestep.svelte';
	import Label from '../label.svelte';

	const stopCycle = () => {
		if ($machineData.cycle.status.mode !== 'ended') {
			fetch('//' + $Linker + '/api/v1/cycle', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
			});
		}
	};

	$useNavContainer = false;

	onMount(() => {
		$navTitle = [$_('cycle.button'), $_('cycle.names.' + $machineData.cycle.name)];
		if ($machineData.cycle.profile) {
			$navTitle = [
				...$navTitle,
				$machineData.cycle.profile.isPremade
					? $_('cycle.types.' + $machineData.cycle.profile.name)
					: $machineData.cycle.profile.name,
			];
		}
	});
</script>

<Flex class="-mt-4">
	<Navcontainer class="min-w-[65%] max-w-[75%] transition-all self-start">
		<Navcontainertitle>{$_('cycle.steps.title')}</Navcontainertitle>
		<Flex direction="col">
			{#if $machineData.cycle}
				{#each $machineData.cycle.steps.filter((s) => s.isEnabled.data == 1) as s}
					<Cyclestep bind:step={s} />
				{/each}
			{/if}
		</Flex>
	</Navcontainer>

	<Navcontainer class="grow self-start">
		<Navcontainertitle>{$_('cycle.steps.status')}</Navcontainertitle>

		<Flex direction="col" gap={2}>
			{#if $machineData.cycle.status.progress != -1}
				<Label>
					{$_('cycle.eta.remaining')}:
					<span class="dark:text-indigo-400 text-indigo-600 font-semibold">
						{#if $machineData.cycle.status.estimatedRunTime !== undefined}
							{@const done = parseTime(
								$machineData.cycle.status.startDate / 1000 +
									$machineData.cycle.status.estimatedRunTime -
									Date.now() / 1000,
							)}
							{#if done.hours}
								{done.hours}h
							{/if}
							{done.minutes}m {done.seconds}s
						{/if}
					</span>
				</Label>
				<Label>
					{$_('cycle.eta.estimated')}:
					<span class="dark:text-indigo-400 text-indigo-600 font-semibold">
						{#if $machineData.cycle.status.estimatedRunTime !== undefined}
							{@const done = parseTime($machineData.cycle.status.estimatedRunTime)}

							{#if done.hours > 0}
								{done.hours}h
							{/if}
							{done.minutes > 0 ? done.minutes : 0}m {done.seconds > 0
								? done.seconds
								: 0}s
						{/if}
					</span>
				</Label>
			{:else}
				<Label>
					{$_('cycle.eta.estimated')}:
					<span class="dark:text-indigo-400 text-indigo-600 font-semibold">
						{$_('cycle.eta.null')}
					</span>
				</Label>
			{/if}

			<Button color={'bg-red-500'} on:click={stopCycle}>{$_('cycle.buttons.end')}</Button>
		</Flex>

		{#if $machineData.cycle.status.additionalInfo !== undefined}
			<Navcontainertitlesided class="mt-6">
				{$_('cycle.steps.additional-info')}
			</Navcontainertitlesided>
		{/if}
	</Navcontainer>
</Flex>
