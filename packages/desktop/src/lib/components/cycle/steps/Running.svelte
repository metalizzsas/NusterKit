<script lang="ts">
	import { Linker } from '$lib/utils/stores/linker';
	import { machineData } from '$lib/utils/stores/store';
	import { parseTime } from '$lib/utils/dateparser';

	import { _ } from 'svelte-i18n';

	import Navcontainertitle from '../../navigation/navcontainertitle.svelte';
	import Navcontainer from '../../navigation/navcontainer.svelte';
	import Button from '../../button.svelte';
	import Flex from '../../layout/flex.svelte';
	import Cyclestep from '../cyclestep.svelte';
	import Label from '../../label.svelte';
	import Navtitle from '$lib/components/navigation/navstack/navtitle.svelte';
	import { translateProfileName } from '$lib/components/profile/profiletranslation';

	const stopCycle = () => {
		if ($machineData.cycle?.status.mode !== 'ended') {
			void fetch(`//${$Linker}/api/v1/cycle`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
			});
		}
	};

	const nextStep = () => {
		if ($machineData.machine.settings?.isPrototype == true) {
			void fetch(`//${$Linker}/api/v1/cycle/nextStep`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
			});
		}
	};
</script>

<Navtitle title={[
	$_('cycle.button'),
	$_(`cycle.names.${$machineData.cycle?.name || 'default'}`),
	...($machineData.cycle?.profile) ? [translateProfileName($_, $machineData.cycle.profile)] : []
]} />

{#if $machineData.cycle}
	<Flex class="-mt-4">
		<Navcontainer class="w-[70%] transition-all self-start">
			<Navcontainertitle>{$_('cycle.steps.title')}</Navcontainertitle>
			<Flex direction="col">
				{#if $machineData.cycle}
					{#each $machineData.cycle.steps.filter((s) => s.isEnabled.data == 1) as s}
						<Cyclestep bind:step={s} />
					{/each}
				{/if}
			</Flex>
		</Navcontainer>

		<Flex direction="col" class="self-start grow">
			<Navcontainer>
				<Navcontainertitle>{$_('cycle.steps.status')}</Navcontainertitle>
	
				<Flex direction="col" gap={2}>
					{#if $machineData.cycle.status.progress != -1}
						<Label>
							<span class="font-medium">{$_('cycle.eta.remaining')}:</span>
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
						</Label>
						<Label>
							<span class="font-medium">{$_('cycle.eta.estimated')}:</span>
							{#if $machineData.cycle.status.estimatedRunTime !== undefined}
								{@const done = parseTime(
									$machineData.cycle.status.estimatedRunTime,
								)}

								{#if done.hours > 0}
									{done.hours}h
								{/if}
								{done.minutes > 0 ? done.minutes : 0}m {done.seconds > 0
									? done.seconds
									: 0}s
							{/if}
						</Label>
					{:else}
						<Label>
							<span class="font-medium">{$_('cycle.eta.estimated')}:</span> {$_('cycle.eta.null')}
						</Label>
					{/if}
					{#if $machineData.machine.settings?.isPrototype == true && $machineData.cycle.currentStepIndex < $machineData.cycle.steps.length - 1}
						<Button color={'bg-orange-500'} on:click={nextStep}>Next step</Button>
					{/if}
					<Button color={'bg-red-500'} on:click={stopCycle}>{$_('cycle.buttons.end')}</Button>
				</Flex>
			</Navcontainer>

			{#if $machineData.cycle.additionalInfo}
				<Navcontainer class="mt-0">
					<Navcontainertitle>{$_('cycle.steps.additional-info')}</Navcontainertitle>

					<Flex direction="col" gap={3}>
						{#each $machineData.cycle.additionalInfo as info}
							<Label><span class="font-medium">{$_(`gates.names.${info.value.name}`)}:</span> {info.value.value} {info.value.unity}</Label>
						{/each}
					</Flex>
					
				</Navcontainer>	
			{/if}
		</Flex>
	</Flex>
{/if}
