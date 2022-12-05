<script lang="ts">

    import type { IOGates } from '@metalizzsas/nuster-typings/build/spec/iogates';

    export let gate: IOGates;

    const updateGate = (name: string, value: boolean) => {
		name = name.replace('#', '_');

		void fetch(
			`http://localhost:4081/io/${name}/${value === true ? 1 : 0}`,
			{ method: 'post' }
		);
	};

</script>

<div
    style="display:flex; flex-direction: column; align-items: start; gap: 0.25em; padding: 0.5em; border-radius: 0.25em; background-color: #ccc;"
>
    <span style="font-weight:600;">{gate.name}</span>
    <span style="font-weight: 500;">Value: <span style:color={gate.value > 0 ? 'emerald' : 'red'}>{gate.value}</span></span>
    

    {#if gate.bus == 'in'}
        {#if gate.size == 'bit'}
        <span style="display:flex; gap:0.25em; align-items: center; font-size: 0.9rem;">
            <input
                type="checkbox"
                checked={gate.value}
                on:change={(e) => {
                    updateGate(gate.name, e.target.checked);
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
        {/if}
    {/if}
</div>