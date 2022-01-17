<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';
	import type { IWSObject, Manual } from '$lib/utils/interfaces';

	export const load: Load = async (ctx) => {
		let cnt = await fetch('http://127.0.0.1/v1/manual');

		let data: Manual[] = await cnt.json();

		return { props: { data: data } };
	};
</script>

<script lang="ts">
	import '$lib/app.css';

	import { onMount } from 'svelte';

	import Toggle from '$lib/components/Toggle.svelte';

	export let data: Manual[];

	onMount(() => {
		let ws = new WebSocket('ws://127.0.0.1/v1');

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

<div class="rounded-xl p-3 pt-0 -m-2 mt-12 bg-neutral-200 dark:bg-neutral-800 shadow-xl group">
	<div class="flex flex-row gap-5 justify-items-end -translate-y-4">
		<a
			href="/app"
			class="rounded-xl bg-red-400 text-white py-1 px-3 font-semibold flex flex-row gap-2 items-center"
		>
			<svg
				id="glyphicons-basic"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 32 32"
				class="h-5 w-5 fill-white"
			>
				<path
					id="chevron-left"
					d="M22.41406,23.37866a.5.5,0,0,1,0,.70709L19.586,26.91425a.50007.50007,0,0,1-.70715,0L8.67151,16.70709a.99988.99988,0,0,1,0-1.41418L18.87885,5.08575a.50007.50007,0,0,1,.70715,0l2.82806,2.8285a.5.5,0,0,1,0,.70709L15.03564,16Z"
				/>
			</svg>
		</a>
		<div
			class="rounded-xl bg-indigo-500 text-white py-1 px-8 font-semibold shadow-md group-hover:scale-105 transition-all"
		>
			Mode manuel
		</div>

		<a
			class="rounded-xl bg-orange-500 text-white font-semibold py-1 px-3 shadow-md"
			href="/app/advanced/gates"
		>
			Portes IO
		</a>
	</div>

	<div class="bg-orange-500 text-white my-4 p-3 rounded-xl flex flex-row gap-4 items-center">
		<span
			class="block rounded-full p-2 bg-white text-orange-500 font-bold h-8 w-8 text-center shadow-md leading-4"
		>
			!
		</span>
		Les modes manuels permettent d'activer un groupe d'organes de la machines pour qu'ils fonctionnent
		ensemble.
	</div>

	<div class="mt-5 flex flex-col gap-4">
		{#each data as item}
			<div class="rounded-xl bg-black px-3 py-2 flex flex-row justify-between">
				<span class="text-white font-semibold">{item.name}</span>
				<Toggle
					bind:value={item.state}
					on:change={(e) => toggleState(item.name, e.detail.value)}
				/>
			</div>
		{/each}
	</div>
</div>
