<script lang="ts">
	import '$lib/app.css';
	import type { IWSContent } from '$lib/utils/interfaces';

	import { selectedMachine } from '$lib/utils/store';
	import { onMount } from 'svelte';
	import Slot from './Slot.svelte';

	let data: IWSContent = {
		io: [],
		slots: [],
		passives: [],
	};

	let displayed = 'main';

	onMount(() => {
		let ws = new WebSocket(`ws://${$selectedMachine.ipAddress}/`);

		ws.onmessage = (ev: MessageEvent) => {
			data = JSON.parse(ev.data);
			console.log(data);
		};
	});
</script>

<div class="text-left">
	<h1 class="text-2xl uppercase">{$selectedMachine.name}</h1>

	<div class="bg-gray-300 p-3 rounded-3xl my-2">
		<h2 class="text-lg text-gray-700 uppercase">
			{$selectedMachine.model}{$selectedMachine.modelVariant}{$selectedMachine.modelRevision}
		</h2>
		<h3 class="text-sm text-italic">{$selectedMachine.serial}</h3>
	</div>

	<div class="">
		<h2 class="text-xl text-zinc-800 my-3">Procédures</h2>
		<div class="flex flex-col gap-4">
			<button
				class="shadow-xl bg-gradient-to-r from-indigo-500 to-purple-500 py-3 px-5 text-white text-left font-semibold rounded-full"
			>
				Cycles
			</button>
			<button
				class="shadow-xl bg-gradient-to-r from-indigo-500 to-purple-500 py-3 px-5 text-white text-left font-semibold rounded-full"
			>
				Profils
			</button>
			<button
				class="shadow-xl bg-gradient-to-r from-indigo-500 to-purple-500 py-3 px-5 text-white text-left font-semibold rounded-full"
			>
				Mode avancé
			</button>
		</div>
	</div>

	<div class="">
		<h2 class="text-xl text-zinc-800 my-3">Slots</h2>
		<div class="flex flex-row flex-wrap justify-items-start gap-4">
			{#each data.slots as slot, i}
				<Slot bind:slot />
			{/each}
		</div>
	</div>

	<div class="">
		<h2 class="text-xl text-zinc-800 my-3">Maintenances</h2>
		<div class="grid grid-cols-3 gap-4">Content</div>
	</div>
</div>

<div class="text-left">
	{#each data.profiles as item}
		<!-- content here -->
	{/each}
</div>
