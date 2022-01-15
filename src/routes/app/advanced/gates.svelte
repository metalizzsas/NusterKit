<script context="module" lang="ts">
	export const load: Load = async (ctx) => {
		let data = await ctx.fetch('http://127.0.0.1/v1/io');

		let gates: Io[] = await data.json();

		return { props: { gates: gates } };
	};
</script>

<script lang="ts">
	import InputBlock from '$lib/components/io/InputBlock.svelte';

	import type { Io, IWSObject } from '$lib/utils/interfaces';

	import Toggle from '$lib/components/Toggle.svelte';
	import { onMount } from 'svelte';
	import type { Load } from '@sveltejs/kit';

	export let gates: Io[];

	onMount(() => {
		let ws = new WebSocket('ws://127.0.0.1/v1');

		ws.onmessage = (event) => {
			let data: IWSObject = JSON.parse(event.data);
			gates = data.io;
		};
	});
</script>

<div class="rounded-xl p-3 pt-0 -m-2 mt-12 bg-neutral-200 dark:bg-neutral-800 shadow-xl group">
	<div class="flex flex-row gap-5 justify-items-end -translate-y-4">
		<a
			href="/app/advanced"
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
			Portes I/O
		</div>
	</div>

	<div class="grid grid-cols-2 gap-4">
		<div>
			<div class="flex flex-row items-center gap-4">
				<span
					class="rounded-xl bg-sky-600/80 py-1 px-6 text-white font-semibold mb-2 inline-block shadow-xl"
				>
					Entrées
				</span>

				<div class="h-0.5 bg-slate-600/10 w-full mb-2" />
			</div>

			<div class="flex flex-col gap-4">
				{#each gates.filter((g) => g.bus == 'in') as input}
					<InputBlock bind:gate={input} />
				{/each}
			</div>
		</div>
		<div>
			<div class="flex flex-row items-center gap-4">
				<span
					class="rounded-xl bg-sky-600/80 py-1 px-6 text-white font-semibold mb-2 inline-block shadow-xl"
				>
					Sorties
				</span>

				<div class="h-0.5 bg-slate-600/10 w-full mb-2" />
			</div>

			<div class="flex flex-col gap-4">
				{#each gates.filter((g) => g.bus == 'out') as output}
					<div
						class="flex flex-row justify-between gap-4 bg-slate-100 py-2 px-4 rounded-xl ring-1 ring-slate-400/10 font-semibold"
					>
						<span>
							{output.name}
						</span>
						{#if output.size == 'bit'}
							<Toggle bind:value={output.value} />
						{:else}
							<input type="range" min="0" max="100" bind:value={output.value} />
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
