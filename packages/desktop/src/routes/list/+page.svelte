<script lang="ts">
	import { beforeUpdate, onMount } from 'svelte';
	import Modalcontent from '$lib/components/modals/modal.svelte';
	import Machine from '$lib/components/machinelist/machine.svelte';
	import { BUNDLED } from '$lib/utils/bundle';
	import { goto } from '$app/navigation';
	import { machineList } from '$lib/utils/stores/list';
	import { _ } from 'svelte-i18n';

	let displayAddMachine = false;

	beforeUpdate(() => {
		if (BUNDLED == 'true') void goto('/app');
	});

	onMount(() => {
		const localData = localStorage.getItem('machines');

		if (localData !== null) {
			$machineList = JSON.parse(localData) as typeof $machineList;
		} else {
			$machineList = [];
		}
	});

	const saveMachineList = () => {
		localStorage.setItem('machines', JSON.stringify($machineList));
	}

	const addMachine = (name: string, ip: string) => {
		$machineList = [...$machineList, { name, ip }];

		newMachineIP = '';
		newMachineName = '';
		saveMachineList();
	}

	let newMachineName = '';
	let newMachineIP = '';
</script>

<Modalcontent bind:shown={displayAddMachine} title="Ajouter une machine">
	<div class="flex flex-col gap-3">
		<div class="flex flex-col gap-1">
			<span class="text-base">Nom de la machine</span>
			<input
				type="text"
				class="bg-neutral-100 text-neutral-700 py-2 px-5"
				bind:value={newMachineName}
			/>
		</div>

		<div class="flex flex-col gap-1">
			<span class="text-base">Addresse IP</span>
			<input
				type="text"
				class="bg-neutral-100 py-2 px-5 text-neutral-700"
				bind:value={newMachineIP}
			/>
		</div>

		<button
			class="bg-emerald-500 rounded-xl py-1 px-5 text-white font-semibold self-center"
			on:click={() => {
				addMachine(newMachineName, newMachineIP);
				displayAddMachine = false;
			}}
		>
			Ajouter
		</button>
	</div>
</Modalcontent>

<main>
	<div
		class="flex flex-row gap-3 items-center bg-gradient-to-br from-indigo-500 to-indigo-600 p-4 rounded-xl"
	>
		<img src="/icons/pwa-192.png" class="h-8 w-8 rounded-md" alt="logo nuster" />
		<h1 class="text-xl text-white align-middle">
			Nuster <span class="text-sm">/ {$_('machinelist')}</span>
		</h1>

		<button
			on:click={() => (displayAddMachine = true)}
			class="rounded-xl bg-indigo-300 text-white font-semibold py-1 px-5 ml-auto sm:block hidden"
		>
			{$_('machinelist-add')}
		</button>
	</div>

	<div
		class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl-grid-cols-6 gap-4 mt-4 p-4 rounded-xl bg-neutral-200 dark:bg-neutral-800"
	>
		<button
			on:click={() => (displayAddMachine = true)}
			class="rounded-xl bg-indigo-300 text-white font-semibold py-1 px-5 sm:hidden block"
		>
			{$_('machinelist-add')}
		</button>
		{#each $machineList as machine, index}
			<Machine {machine} machineIndex={index} />
		{:else}
			<div>{$_('machinelist-empty')}</div>
		{/each}
	</div>
</main>
