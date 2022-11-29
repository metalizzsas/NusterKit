<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import '$lib/app.css';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	onMount(() => {
		setInterval(() => {
			invalidateAll();
		}, 1000);
	});

	const updateGate = (name: string, controllerID: number, value: boolean) => {
		name = name.replace('#', '_');

		void fetch(
			`http://localhost:4081/controller/${controllerID}/${name}/${value === true ? 1 : 0}`,
			{ method: 'post' }
		);
	};
</script>

<div style="background: #eee; margin: 1.5em; padding: 1em; border-radius: 1em;">
	<h1>IOGates</h1>
	<div style="display:flex; flex-direction: column; gap: 1em;">
		{#each data.gates as gate}
			<div
				style="display:flex; flex-direction: row; gap: 1em; padding: 0.5em; border-radius: 0.25em; background-color: #ccc;"
			>
				<span style="font-weight:500;">{gate.name}</span>
				<span>{gate.value}</span>

				{#if gate.bus == 'in'}
					{#if gate.size == 'bit'}
						<input
							type="checkbox"
							checked={gate.value}
							on:change={(e) => {
								updateGate(gate.name, gate.controllerId, e.target.checked);
							}}
						/>
					{:else if gate.type == 'mapped'}
						<input
							type="range"
							min={gate.mapInMin}
							max={gate.mapOutMax}
							value={gate.value}
							on:change={(e) => {
								updateGate(gate.name, gate.controllerId, e.target.value);
							}}
						/>
					{/if}
				{/if}
			</div>
		{/each}
	</div>
</div>
