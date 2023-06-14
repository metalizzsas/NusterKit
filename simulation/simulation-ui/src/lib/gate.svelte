<script lang="ts">
	import type { IOGatesHydrated } from "@metalizzsas/nuster-typings/build/hydrated/io";

	export let gate: IOGatesHydrated;

	const updateGate = (name: string, value: number) => {
		name = name.replace('#', '_');

		void fetch(`http://localhost:4082/io/${name}/${value}`, { method: 'post' });
	};

	export function map(source: number, inMin: number, inMax: number, outMin: number, outMax: number)
	{
	return (source - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
	}

</script>

<div style="display:flex; flex-direction: column; align-items: start; gap: 0.25em; padding: 0.5em; border-radius: 0.25em; background-color: #ccc;">
	<span style="font-weight:600;">{gate.name}</span>
	{#if gate.bus == 'in'}
		{#if gate.size == 'bit'}
			<span style="display:flex; gap:0.25em; align-items: center; font-size: 0.9rem;">
				<input
					type="checkbox"
					checked={gate.value}
					on:change={(e) => {
						updateGate(gate.name, e.target.checked ? 1 : 0);
					}}
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
				on:change={(e) => {
					updateGate(gate.name, e.target.value);
				}}
			/>
		{:else if gate.type == "pt100"}
			Value: {gate.value / 10} °C
			<input
				type="range"
				min={0}
				max={100}
				value={gate.value / 10}
				on:change={(e) => {
					updateGate(gate.name, e.target.value);
				}}
			/>
		{/if}
	{/if}
</div>
