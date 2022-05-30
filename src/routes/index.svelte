<script lang="ts">
	import '$lib/app.css';
	import { onMount } from 'svelte';
	import Modalcontent from '$lib/components/modals/modalcontent.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let displayAddMachine = false;

	let machineList: { name: string; ip: string }[] = [];

	onMount(() => {
		const localData = localStorage.getItem('machines');

		if (localData !== null) {
			machineList = JSON.parse(localData);
		}
	});

	function updateMachineList() {
		localStorage.setItem('machines', JSON.stringify(machineList));
		machineList = JSON.parse(localStorage.getItem('machines')!);
	}

	function addMachine(name: string, ip: string) {
		machineList.push({ name, ip });
	}

	let newMachineName: string = '';
	let newMachineIP: string = '';
</script>

<Modalcontent bind:shown={displayAddMachine} title="Ajouter une machine">
	<div class="flex flex-col gap-4">
		<div class="flex flex-row gap-4 justify-between">
			<span>Nom de la machine :</span>
			<input type="text" class="bg-gray-300 py-2 px-5" bind:value={newMachineName} />
		</div>

		<div class="flex flex-row gap-4 justify-between">
			<span>Addresse IP :</span>
			<input type="text" class="bg-gray-300 py-2 px-5" bind:value={newMachineIP} />
		</div>

		<button
			class="bg-orange-500 rounded-xl py-1 px-3 text-white font-semibold self-center"
			on:click={() => {
				addMachine(newMachineName, newMachineIP);
				updateMachineList();
				displayAddMachine = false;
			}}
		>
			Ajouter
		</button>
	</div>
</Modalcontent>

<main>
	<div class="flex flex-row justify-between items-center my-4">
		<h1 class="text-3xl text-gray-800">NusterDesktop</h1>

		<button
			on:click={() => (displayAddMachine = true)}
			class="rounded-xl bg-indigo-500 text-white font-semibold py-1 px-5"
		>
			Add machine
		</button>
	</div>

	<div class="flex flex-col gap-4">
		{#each [{ name: 'Machine', ip: $page.url.hostname }, ...machineList] as machine, index}
			<div
				class="flex flex-row bg-slate-500 text-white rounded-xl p-2 items-center justify-between cursor-pointer"
				on:click={async () => {
					window.localStorage.setItem('ip', machine.ip);
					await goto('/app');
				}}
			>
				<div>
					<span class="block font-semibold">{machine.name}</span>
					<span class="block text-xs italic text-gray-300">{machine.ip}</span>
				</div>

				<button
					class="bg-red-500 py-1 px-2 rounded-xl text-white font-semibold"
					on:click|preventDefault={() => {
						machineList.splice(index + 1, 1);
						updateMachineList();
					}}
				>
					Supprimer
				</button>
			</div>
		{/each}
	</div>
</main>
