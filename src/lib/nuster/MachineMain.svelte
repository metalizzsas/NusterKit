<script lang="ts">
	import '$lib/app.css';

	import Slot from './Slot.svelte';

	import { machineData } from '$lib/utils/store';
	import { Router, Route, Link } from 'svelte-navigator';
</script>

<div class="text-left">
	<h1 class="text-2xl uppercase">{$machineData.machine.name}</h1>

	<div class="bg-gray-300 p-3 rounded-3xl my-2">
		<h2 class="text-lg text-gray-700 uppercase">
			{$machineData.machine.model}{$machineData.machine.variant}{$machineData.machine
				.revision}
		</h2>
		<h3 class="text-sm text-italic">{$machineData.machine.serial}</h3>
	</div>

	<div class="">
		<h2 class="text-xl text-zinc-800 my-3">Procédures</h2>
		<div class="flex flex-col gap-4">
			<Link to="/cycles">
				<button
					class="shadow-xl bg-gradient-to-r from-indigo-500 to-purple-500 py-3 px-5 text-white text-left font-semibold rounded-full"
				>
					Cycles
				</button>
			</Link>
			<Link to="/profiles">
				<button
					class="shadow-xl bg-gradient-to-r from-indigo-500 to-purple-500 py-3 px-5 text-white text-left font-semibold rounded-full"
				>
					Profils
				</button>
			</Link>
			<Link to="/manual">
				<button
					class="shadow-xl bg-gradient-to-r from-indigo-500 to-purple-500 py-3 px-5 text-white text-left font-semibold rounded-full"
				>
					Mode manuel
				</button>
			</Link>
		</div>
	</div>

	<div class="">
		<h2 class="text-xl text-zinc-800 my-3">Slots</h2>
		<div class="flex flex-row flex-wrap justify-items-start gap-4">
			{#each $machineData.slots as slot, i}
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
	{#each $machineData.profiles as p}
		p.name
	{/each}
</div>
