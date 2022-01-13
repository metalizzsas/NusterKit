<script lang="ts">
	import '$lib/app.css';
	import SlotProduct from '$lib/components/SlotProduct.svelte';
	import type { IWSObject } from '$lib/utils/interfaces';
	import { machineData } from '$lib/utils/store';
	import { onMount } from 'svelte';

	onMount(() => {
		let ws = new WebSocket('ws://localhost/v1');

		ws.onmessage = (e: MessageEvent) => {
			let data = JSON.parse(e.data) as IWSObject;

			$machineData = data;
		};
	});
</script>

<!-- header info block -->
<div
	class="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-b-3xl -m-6 mb-5 p-5 text-white shadow-2xl"
	id="informationWrapper"
>
	<div class="grid grid-col-2 gap-4">
		<div id="informationContent">
			<div class="flex flex-row justify-between items-center mb-4">
				<span
					class="inline-block text-white font-semibold border-b-zinc-100 border-b-2 text-lg"
				>
					Informations machine
				</span>

				<button class="rounded-full backdrop-brightness-125 p-1">
					<svg
						id="glyphicons-basic"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 32 32"
						class="fill-white h-5 w-5"
					>
						<path
							id="circle-info"
							d="M16,4A12,12,0,1,0,28,16,12.01312,12.01312,0,0,0,16,4Zm2.42529,10.91565L16.6,21h1.25958a.5.5,0,0,1,.48505.62134l-.25,1A.50007.50007,0,0,1,17.60962,23H14a1.40763,1.40763,0,0,1-1.42529-1.91565L14.4,15h-.75958a.5.5,0,0,1-.48505-.62134l.25-1A.49994.49994,0,0,1,13.89038,13H17A1.40763,1.40763,0,0,1,18.42529,14.91565Zm.14435-3.33337A.5.5,0,0,1,18.07642,12H15.59021a.5.5,0,0,1-.49316-.58228l.33331-2A.5.5,0,0,1,15.92358,9h2.48621a.5.5,0,0,1,.49316.58228Z"
						/>
					</svg>
				</button>
			</div>

			<div class="grid grid-cols-3 gap-5 items-center">
				<span
					class="block text-white font-medium py-2 px-4 rounded-full backdrop-brightness-125"
				>
					Modèle: {$machineData.machine.model.toLocaleLowerCase()}
				</span>
				<span
					class="block text-white font-medium py-2 px-4 rounded-full backdrop-brightness-125"
				>
					Variante: {$machineData.machine.variant.toUpperCase()}
				</span>
				<span
					class="block text-white font-medium py-2 px-4 rounded-full backdrop-brightness-125"
				>
					Révision: {$machineData.machine.revision}
				</span>
			</div>
			<div class="flex flex-col mt-3">
				<span
					class="block text-white font-medium py-2 px-4 rounded-full backdrop-brightness-125"
				>
					Numéro de série: {$machineData.machine.serial.toLocaleUpperCase()}
				</span>
			</div>
		</div>
	</div>
</div>

<div class="rounded-xl p-3 pt-0 -m-2 mt-12 bg-neutral-200 shadow-xl">
	<div class="flex flex-row justify-items-end -translate-y-5">
		<div class="rounded-xl bg-indigo-500 text-white py-2 px-8 font-semibold shadow-md">
			Procédures
		</div>
	</div>

	<div class="grid grid-cols-3">
		<a href="app/cycles" class="block">
			<button
				class="shadow-xl bg-gradient-to-r from-indigo-500 to-purple-500 py-3 px-5 text-white text-left font-semibold rounded-full"
			>
				Cycles
			</button>
		</a>
		<a href="app/profiles">
			<button
				class="shadow-xl bg-gradient-to-r from-indigo-500 to-purple-500 py-3 px-5 text-white text-left font-semibold rounded-full"
			>
				Profils
			</button>
		</a>
		<a href="app/advanced">
			<button
				class="shadow-xl bg-gradient-to-r from-indigo-500 to-purple-500 py-3 px-5 text-white text-left font-semibold rounded-full"
			>
				Mode manuel
			</button>
		</a>
	</div>
</div>

<div class="rounded-xl p-3 pt-0 -m-2 mt-12 bg-neutral-200 shadow-xl">
	<div class="flex flex-row justify-items-end -translate-y-5">
		<div class="rounded-xl bg-purple-500 text-white py-2 px-8 font-semibold shadow-md">
			Slots
		</div>
	</div>

	<div class="flex flex-col gap-4">
		{#each $machineData.slots as slot, i}
			<SlotProduct bind:slot />
		{/each}
	</div>
</div>

<div class="rounded-xl p-3 pt-0 -m-2 mt-12 bg-neutral-200 shadow-xl">
	<div class="flex flex-row justify-items-end -translate-y-5">
		<div class="rounded-xl bg-cyan-500 text-white py-2 px-8 font-semibold shadow-md">
			Maintenances
		</div>
	</div>

	<div class="flex flex-col gap-4">
		{#each $machineData.maintenances.filter((m) => m.name !== 'cycleCount') as m}
			<span>{m.name}</span>
		{/each}
	</div>
</div>
