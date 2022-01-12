<script context="module" lang="ts">
	export async function load(ctx) {
		let cnt = await fetch('http://127.0.0.1/v1/manual');

		let data: Manual[] = await cnt.json();

		return { props: { data: data } };
	}
</script>

<script lang="ts">
	import '$lib/app.css';
	import HeaderBack from '$lib/components/HeaderBack.svelte';
	import Toggle from '$lib/components/toggle.svelte';
	import type { IWSObject, Manual } from '$lib/utils/interfaces';
	import { onMount } from 'svelte';

	export let data: Manual[];

	onMount(() => {
		let ws = new WebSocket('ws://localhost/v1');

		ws.onmessage = (ev: MessageEvent) => {
			const d: IWSObject = JSON.parse(ev.data);
			data = d.manuals;
		};
	});

	function toggleState(name: string, state: boolean) {
		console.log('setting', name, 'to', state);
		fetch(`http://127.0.0.1/v1/manual/${name}/${state}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}
</script>

<main>
	<HeaderBack title="Modes manuels">
		<a
			href="advanced/gates"
			class="bg-orange-500 text-white rounded-full font-semibold py-1 px-2"
		>
			Portes I/O >
		</a>
	</HeaderBack>

	<div class="bg-orange-700 text-white my-4 p-3 rounded-3xl flex flex-row gap-4 items-center">
		<span class="rounded-full px-4 py-1 bg-white text-orange-500 font-bold">!</span>
		Les modes manuels permettent d'activer un groupe d'organes de la machines pour qu'ils fonctionnent
		ensemble.
	</div>

	<div id="manualWrapped" class="flex flex-col gap-4">
		{#each data as item}
			<div class="rounded-full bg-black px-3 py-2 flex flex-row justify-between">
				<span class="text-white font-semibold">{item.name}</span>
				<Toggle
					bind:value={item.state}
					on:change={(e) => toggleState(item.name, e.detail.value)}
				/>
			</div>
		{/each}
	</div>
</main>
