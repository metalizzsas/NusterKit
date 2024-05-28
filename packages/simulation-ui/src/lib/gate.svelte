<script lang="ts">
	import type { IOGatesHydrated } from "@nuster/turbine/types/hydrated/io";
	import { enhance } from "$app/forms";

	export let gate: IOGatesHydrated;
	let submitButton: HTMLButtonElement;

	export function map(source: number, inMin: number, inMax: number, outMin: number, outMax: number)
	{
		return (source - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
	}
</script>

<form action="?/updateGateValue" method="post" use:enhance style="display:flex; flex-direction: column; align-items: start; gap: 0.25em; padding: 0.5em; border-radius: 0.25em; background-color: #ccc;">
	<span style="font-weight:600;">{gate.name}</span>
	<input type="hidden" name="gate" value={gate.name} />

	<button bind:this={submitButton} style:visibility={"hidden"} />

	{#if gate.bus == 'in'}
		{#if gate.size == 'bit'}
			<span style="display:flex; gap:0.25em; align-items: center; font-size: 0.9rem;">
				<input
					type="checkbox"
					checked={gate.value === 1}
					name="value_checked"
					on:change={() => { submitButton.click(); }}
				/>
				Change value
			</span>
		{:else if gate.type == 'mapped'}
			{@const v = map(gate.value, gate.mapInMin, gate.mapInMax, gate.mapOutMin, gate.mapOutMax)}
			Value: {v} {gate.unity}
			<input
				type="range"
				min={gate.mapOutMin}
				max={gate.mapOutMax}
				step={0.1}
				value={v}
				name="value"
				on:change={() => { submitButton.click(); }}
			/>
		{:else if gate.type == "pt100"}
			Value: {gate.value / 10} °C
			<input
				type="range"
				min={0}
				max={100}
				value={gate.value / 10}
				name="value"
				on:change={() => { submitButton.click(); }}
			/>
		{/if}
	{/if}
</form>
