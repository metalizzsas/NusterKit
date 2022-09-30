<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Modalcontent from '../modals/modalcontent.svelte';
	import { machineList } from '$lib/utils/stores/list';
	import Modal from '../modals/modal.svelte';
	import type { IWSObject } from '$lib/utils/interfaces';
	import { _ } from 'svelte-i18n';

	enum machineStatus {
		ONLINE = 'online',
		OFFLINE = 'offline',
		PENDING = 'pending',
	}

	const machineStatusColor: { [x: string]: string } = {
		online: 'bg-emerald-500 animate-pulse-slim',
		offline: 'bg-red-500',
		pending: 'bg-orange-500 animate-pulse',
	};

	export let machine: { name: string; ip: string };
	export let machineIndex: number;

	let machineAvailable: machineStatus = machineStatus.PENDING;
	let machineData: IWSObject | undefined;

	let editMenuShown = false;
	let deletePromptShown = false;

	$: $machineList, fetchStatus();

	onMount(() => {
		fetchStatus();
	});

	const fetchStatus = async () => {
		try {
			const status = await fetch('//' + machine.ip + '/api/ws');

			machineAvailable = status.status == 200 ? machineStatus.ONLINE : machineStatus.OFFLINE;
			machineData = (await status.json()) as IWSObject;
		} catch (ex) {
			machineAvailable = machineStatus.OFFLINE;
		}
	};

	const login = async () => {
		localStorage.setItem('ip', machine.ip);
		goto('/app');
	};

	const saveMachineList = () => {
		localStorage.setItem('machines', JSON.stringify($machineList));
	};

	const selfDelete = () => {
		$machineList.splice(machineIndex, 1);
		$machineList = $machineList;
		saveMachineList();
	};
</script>

<Modalcontent bind:shown={editMenuShown} title="Modifier une machine">
	<div class="flex flex-col gap-3">
		<div class="flex flex-col gap-1">
			<span class="text-base">Nom de la machine</span>
			<input
				type="text"
				class="bg-neutral-100 text-neutral-700 py-2 px-5"
				bind:value={machine.name}
			/>
		</div>

		<div class="flex flex-col gap-1">
			<span class="text-base">Addresse IP</span>
			<input
				type="text"
				class="bg-neutral-100 py-2 px-5 text-neutral-700"
				bind:value={machine.ip}
			/>
		</div>

		<button
			class="bg-emerald-500 rounded-xl py-1 px-5 text-white font-semibold self-center"
			on:click={() => {
				editMenuShown = false;
				saveMachineList();
			}}
		>
			Modifier
		</button>
	</div>
</Modalcontent>

<Modal
	bind:shown={deletePromptShown}
	title={'Confirmation'}
	buttons={[
		{
			text: 'Oui',
			color: 'bg-red-400',
			callback: () => selfDelete(),
		},
		{
			text: 'Non',
			color: 'bg-emerald-400',
		},
	]}
>
	{'Souhaitez vous supprimer la machine ' + machine.name + ' ?'}
</Modal>

<article
	class="relative w-full aspect-[2/1] md:aspect-square ring-[3px] hover:ring-[4px] ring-indigo-500 hover:ring-indigo-600 duration-300 bg-gray-400 rounded-xl p-4 flex flex-col gap-2 text-white truncate cursor-pointer group"
	on:click={login}
>
	<div class="flex flex-row justify-between items-center">
		<span class="font-semibold text-xl truncate leading-tight">{machine.name}</span>
		<div class="h-4 aspect-square {machineStatusColor[machineAvailable]} rounded-full" />
	</div>

	{#if machineData !== undefined}
		<span class="text-sm leading-tight italic">
			<span class="font-semibold">{$_('machines.' + machineData.machine.model)}</span>
			{machineData.machine.variant}
			{machineData.machine.revision}
		</span>
	{/if}

	<span class="text-sm leading-tight">
		<span class="font-semibold">IP:</span>
		{machine.ip}
	</span>

	<div class="flex flex-row gap-2 absolute bottom-4 w-[calc(100%-2rem)]">
		<button
			class="h-6 bg-orange-400 aspect-square rounded-full relative"
			on:click|stopPropagation={() => (editMenuShown = !editMenuShown)}
		>
			<svg
				id="glyphicons-basic"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 32 32"
				class="h-4 w-4 m-1 fill-white"
			>
				<path
					id="wrench"
					d="M27.405,12.91907a6.38551,6.38551,0,0,1-7.78314,3.70154L8.82825,27.41418A1,1,0,0,1,7.414,27.41412L4.58594,24.58575A.99993.99993,0,0,1,4.586,23.17157L15.33209,12.42548a6.4047,6.4047,0,0,1,3.69947-7.92487,6.22745,6.22745,0,0,1,2.77825-.49127.4987.4987,0,0,1,.34015.84857L19.73254,7.27533a.4961.4961,0,0,0-.131.469l.82916,3.38044a.496.496,0,0,0,.36365.36364l3.38068.82935a.49614.49614,0,0,0,.469-.131l2.419-2.41889a.49433.49433,0,0,1,.8446.30078A6.22117,6.22117,0,0,1,27.405,12.91907Z"
				/>
			</svg>
		</button>
		<button
			class="h-6 bg-red-400 aspect-square rounded-full relative"
			on:click|stopPropagation={() => (deletePromptShown = !deletePromptShown)}
		>
			<svg
				id="glyphicons-basic"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 32 32"
				class="h-4 w-4 m-1 fill-white"
			>
				<path
					id="bin"
					d="M7,26a2.00006,2.00006,0,0,0,2,2H23a2.00006,2.00006,0,0,0,2-2V10H7ZM20,14a1,1,0,0,1,2,0V24a1,1,0,0,1-2,0Zm-5,0a1,1,0,0,1,2,0V24a1,1,0,0,1-2,0Zm-5,0a1,1,0,0,1,2,0V24a1,1,0,0,1-2,0ZM26,6V8H6V6A1,1,0,0,1,7,5h6V4a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1V5h6A1,1,0,0,1,26,6Z"
				/>
			</svg>
		</button>

		{#if machineAvailable == machineStatus.ONLINE}
			<button class="flex flex-row gap-3 align-middle items-center ml-auto">
				<span class="animate-bounceX text-sm font-semibold">{$_('connect')}</span>
				<div
					class="rounded-full h-6 aspect-square bg-indigo-600 transition-all duration-500 ease-in-out font-semibold"
				>
					→
				</div>
			</button>
		{/if}
	</div>
</article>

<style>
	@keyframes bounceX {
		0%,
		100% {
			transform: translateX(0);
			letter-spacing: inherit;
		}
		50% {
			transform: translateX(2.5%);
			letter-spacing: 0.5px;
		}
	}
	.animate-bounceX {
		animation: bounceX 1s infinite ease-in-out;
	}

	@keyframes pulse {
		0%,
		100% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1.05);
			opacity: 0.9;
		}
	}
	.animate-pulse-slim {
		animation: pulse 4s infinite ease-in-out;
	}
</style>
