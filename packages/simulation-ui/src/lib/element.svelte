<script lang="ts">
	import type { IOGatesHydrated } from '@nuster/turbine/types/hydrated/io';
	import { draw, fade } from 'svelte/transition';

	export let gateHistory: IOGatesHydrated[];

	let size = 20;
</script>

<div
	style="display:flex; flex-direction: row; gap: 1em; padding:0.5em; border-radius: 0.5em; background: white; align-items: center;"
>
	<div style="width: 17%;">{gateHistory[0].name} {gateHistory.at(-1)?.value}</div>

	<div
		style="display:flex; flex-direction: column; font-size: 0.75em; justify-content:space-between; padding-top: 0.5em; padding-bottom: 0.5em;"
	>
		<span>1</span>
		<span>0</span>
	</div>

	<svg
		viewBox="0 0 {gateHistory.length * size} 60"
		xmlns="http://www.w3.org/2000/svg"
		style="flex-grow: 1;"
	>
		{#each gateHistory as gate, index (index)}
			<line
				x1={index * size}
				y1={gate.value > 0 ? 20 : 40}
				x2={size + index * size}
				y2={gate.value > 0 ? 20 : 40}
				stroke={gate.value > 0 ? 'green' : 'red'}
				in:draw
				out:fade
			/>

			{#if index > 0}
				{#if gateHistory[index - 1].value !== gate.value}
					<line x1={index * size} y1={20} x2={index * size} y2={40} stroke="black" />
				{/if}
			{/if}
		{/each}
	</svg>
</div>
