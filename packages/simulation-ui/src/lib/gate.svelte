<script lang="ts">
	import type { IOGatesHydrated } from "@metalizzsas/nuster-typings/build/hydrated/io";

	export let gate: IOGatesHydrated;

	const updateGate = (name: string, value: number) => {
		name = name.replace('#', '_');

		void fetch(`http://localhost:4081/io/${name}/${value}`, { method: 'post' });
	};
</script>

<div
	style="display:flex; flex-direction: column; align-items: start; gap: 0.25em; padding: 0.5em; border-radius: 0.25em; background-color: #ccc;"
>
	<span style="font-weight:600;">{gate.name}</span>
	<span style="font-weight: 500;"
		>Value: <span style:color={gate.value > 0 ? 'emerald' : 'red'}>{gate.value}</span></span
	>

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
			<input
				type="range"
				min={gate.mapInMin}
				max={gate.mapOutMax}
				value={gate.value}
				on:change={(e) => {
					updateGate(gate.name, e.target.value);
				}}
			/>
		{:else if gate.type == "pt100"}
			<input
				type="range"
				min={0}
				max={10000}
				value={gate.value}
				on:change={(e) => {
					updateGate(gate.name, e.target.value);
				}}
			/>
		{/if}
	{/if}
</div>
