<script lang="ts">
	import { scale, fade } from 'svelte/transition';
	import '$lib/app.css';
	import { machineList, selectedMachine } from '$lib/utils/store';
	import type { IMachine } from '$lib/utils/store';

	export let machine: IMachine;
	export let index: number;

	let menuDrawn = false;

	const animate = (node: any, args: any) => (args.cond ? fade(node, args) : scale(node, args));
</script>

<div
	class="bg-zinc-300 p-3 rounded-3xl flex flex-row justify-between"
	on:click={() => ($selectedMachine = machine)}
>
	<div class="flex flex-col items-start gap-1">
		<h2 class="text-xl text-gray-700">{machine.name}</h2>
		<span class="text-sm text-gray-600 text-italic">{machine.ipAddress}</span>
	</div>

	<div class="flex flex-row justify-around transition gap-4">
		{#if menuDrawn}
			<button
				class="self-center bg-red-500 py-2 px-5 rounded-full text-gray-200 shadow-sm"
				transition:animate={{ menuDrawn }}
				on:click={() => {
					//TODO: Add messagebox to confirm
					$machineList = $machineList.filter((machine, j) => j != index);
				}}
			>
				Supprimer
			</button>
			<button
				class="self-center bg-orange-400 py-2 px-5 rounded-full text-gray-200 shadow-sm"
				transition:animate
				on:click={() => {
					//TODO: Add machine modifications
				}}
			>
				Modifier
			</button>
		{/if}
		<button
			class="self-center bg-gray-200 rounded-full text-gray-400 p-2 shadow-sm"
			on:click={() => (menuDrawn = !menuDrawn)}
		>
			+
		</button>
	</div>
</div>
