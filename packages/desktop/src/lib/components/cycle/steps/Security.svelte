<script lang="ts">
	import Modal from '../../modals/modalchoice.svelte';
	import { machineData } from '$lib/utils/stores/store';
	import { layoutSimplified } from '$lib/utils/stores/settings';
	import { _ } from 'svelte-i18n';
	import { Linker } from '$lib/utils/stores/linker';
	import Round from '../../round.svelte';
	import Navcontainertitle from '../../navigation/navcontainertitle.svelte';
	import { goto } from '$app/navigation';
	import Button from '../../button.svelte';
	import Flex from '../../layout/flex.svelte';
	import Navcontainer from '$lib/components/navigation/navcontainer.svelte';
	import Navtitle from '$lib/components/navigation/navstack/navtitle.svelte';

	let displaySecurityError = false;
	let displaySecurityWarning = false;

	const scResultColors: { [key: string]: { shadowColor: string; color: string } } = {
		error: {
			color: 'red-500',
			shadowColor: 'red-300',
		},
		warning: {
			color: 'orange-500',
			shadowColor: 'orange-300',
		},
		good: {
			color: 'emerald-500',
			shadowColor: 'emerald-300',
		},
		disabled: {
			color: 'gray-500',
			shadowColor: 'gray-300'
		}
	};

	const preStartCycle = () => {
		if ($machineData.cycle?.startConditions?.filter((sc) => sc.result == 'error').length > 0) {
			displaySecurityError = true;
			return;
		}

		if ($machineData.cycle?.startConditions.filter((sc) => sc.result == 'warning').length > 0) {
			displaySecurityWarning = true;
			return;
		}

		startCycle();
	};

	const startCycle = () => {
		void fetch(`//${$Linker}/api/v1/cycle/`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
		});
	};

	const cancelCycle = () => {
		void fetch(`//${$Linker}/api/v1/cycle/0`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if ($layoutSimplified) void goto('/app');
	};
</script>

<Navtitle title={[$_('cycle.button'), $_(`cycle.names.${$machineData.cycle?.name || 'default'}`),
	...($machineData.cycle?.profile !== undefined
		? $machineData.cycle.profile?.isPremade
			? [$_('cycle.types.' + $machineData.cycle.profile.name)]
			: [$machineData.cycle.profile.name]
		: []),
]} />

<Modal
	title={$_('cycle.modals.security.title')}
	displayClose={false}
	bind:shown={displaySecurityError}
	buttons={[
		{
			text: $_('ok'),
			color: 'bg-gray-600',
		},
	]}
>
	<div class="flex flex-col gap-3">
		{$_('cycle.modals.security.message')}
		<div class="flex flex-col gap-3">
			{#each $machineData.cycle.startConditions.filter((s) => s.result == 'error') as sc}
				<span
					class="flex flex-row justify-between items-center rounded-full bg-zinc-700 py-1 pr-2 pl-3 text-white font-semibold"
				>
					{$_('cycle.startconditions.' + sc.conditionName)}
					<Round
						size={5}
						color={scResultColors[sc.result].color}
						shadowColor={scResultColors[sc.result].shadowColor}
					/>
				</span>
			{/each}
		</div>
	</div>
</Modal>

<Modal
	title={$_('cycle.modals.security-warning.title')}
	displayClose={false}
	bind:shown={displaySecurityWarning}
	buttons={[
		{
			text: $_('cancel'),
			color: 'bg-orange-600',
		},
		{
			text: $_('proceed'),
			color: 'bg-emerald-500',
			callback: () => {
				startCycle();
			},
		},
	]}
>
	<Flex direction="col" gap={3}>
		{$_('cycle.modals.security-warning.message')}
		<Flex direction="col" gap={3}>
			{#each $machineData.cycle.startConditions.filter((s) => s.result == 'warning') as sc}
				<span
					class="flex flex-row justify-between items-center rounded-full bg-zinc-700 py-1 pr-2 pl-3 text-white font-semibold"
				>
					{$_('cycle.startconditions.' + sc.conditionName)}
					<Round
						size={5}
						color={scResultColors[sc.result].color}
						shadowColor={scResultColors[sc.result].shadowColor}
					/>
				</span>
			{/each}
		</Flex>
	</Flex>
</Modal>

<Navcontainer>
	<Navcontainertitle>{$_('cycle.security.conditions')}</Navcontainertitle>
	<Flex direction="col">
		{#if $machineData.cycle}
			<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
				{#each $machineData.cycle.startConditions.filter(sc => sc.result !== "disabled") as sc}
					<span
						class="flex flex-row justify-between items-center rounded-full bg-zinc-700 py-1 pr-2 pl-3 text-white font-semibold"
					>
						{$_('cycle.startconditions.' + sc.conditionName)}
						<Round
							size={5}
							color={scResultColors[sc.result].color}
							shadowColor={scResultColors[sc.result].shadowColor}
						/>
					</span>
				{/each}
			</div>
	
			<Flex class="justify-items-center self-center">
				<Button size={'small'} color={'bg-red-500'} class="self-center" on:click={cancelCycle}>
					{$_('cycle.buttons.cancel')}
				</Button>
				<Button
					size="large"
					color={$machineData.cycle.startConditions.filter((sc) => sc.result == 'error')
						.length > 0
						? 'bg-gray-400 hover:bg-gray-400/80'
						: 'bg-emerald-500 hover:bg-emerald-500/80 hover:scale-[1.01]'}
					class={'flex flex-row gap-1 align-middle items-center fill-white'}
					on:click={preStartCycle}
				>
					{#if $machineData.cycle.startConditions.filter((sc) => sc.result == 'error').length == 0}
						<svg
							id="glyphicons-basic"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 32 32"
							class="h-6 w-6 animate-bounceX"
						>
							<path
								id="arrow-right"
								d="M26.82965,16.81921l-9.25622,6.47937A1,1,0,0,1,16,22.47937V19H6a1,1,0,0,1-1-1V14a1,1,0,0,1,1-1H16V9.52063a1,1,0,0,1,1.57343-.81921l9.25622,6.47937A.99994.99994,0,0,1,26.82965,16.81921Z"
							/>
						</svg>
					{/if}
	
					{$_('cycle.buttons.start')}
				</Button>
			</Flex>
		{/if}
	</Flex>
</Navcontainer>

<style>
	@keyframes bounceX {
		0%,
		100% {
			transform: translateX(-25%);
			animate-timing-function: cubic-bezier(0.8, 0, 1, 1);
		}
		50% {
			transform: none;
			animate-timing-function: cubic-bezier(0, 0, 0.2, 1);
		}
	}

	.animate-bounceX {
		animation: bounceX 1s infinite;
	}
</style>
