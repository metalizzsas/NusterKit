<script lang="ts">
	import type { Io } from '$lib/utils/interfaces';
	import Toggle from '$lib/components/toggle.svelte';
	export let gate: Io;
</script>

<div
	class="flex flex-row justify-between gap-4 bg-slate-100 py-2 px-4 rounded-xl ring-1 ring-slate-400/10 font-semibold"
>
	<span>
		{gate.name}
	</span>
	{#if gate.size == 'bit'}
		<Toggle bind:value={gate.value} locked={true} />
	{:else}
		<input type="range" min="0" max="100" bind:value={gate.value} />
	{/if}
</div>
